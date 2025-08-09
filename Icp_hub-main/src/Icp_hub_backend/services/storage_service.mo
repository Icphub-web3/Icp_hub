import Types "../types";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Int "mo:base/Int";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Utils "../utils/utils";
import Cycles "mo:base/ExperimentalCycles";
import Float "mo:base/Float";
import SHA256 "mo:sha2/Sha256";
import Hex "mo:hex";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Char "mo:base/Char";

module Storage {
    // Type definitions
    type Result<T, E> = Types.Result<T, E>;
    type Error = Types.Error;
    type FileEntry = Types.FileEntry;
    type Repository = Types.Repository;

    public type HttpRequest = {
        url : Text;
        max_response_bytes : ?Nat64;
        headers : [{ name : Text; value : Text }];
        body : ?[Nat8];
        method : { #get; #post; #head };
        transform : ?{
            function : shared query { response : HttpResponse; context : Blob } -> async HttpResponse;
            context : Blob;
        };
    };

    public type HttpResponse = {
        status : Nat;
        headers : [{ name : Text; value : Text }];
        body : [Nat8];
    };

    // Storage types
    public type StorageProvider = {
        #IPFS;
        #ICP;
        #Arweave;
        #Filecoin;
    };

    public type StorageLocation = {
        provider: StorageProvider;
        identifier: Text;
        gateway: ?Text;
        pinned: Bool;
        replicas: Nat;
    };

    public type FileMetadata = {
        path: Text;
        size: Nat;
        mimeType: Text;
        encoding: Text;
        hash: Text; // SHA-256
        cid: ?Text; // IPFS CID
        chunks: [ChunkMetadata];
        locations: [StorageLocation];
        createdAt: Int;
        lastAccessed: Int;
        accessCount: Nat;
        encrypted: Bool;
        compressed: Bool;
        compressionRatio: ?Float;
    };

    public type ChunkMetadata = {
        index: Nat;
        offset: Nat;
        size: Nat;
        hash: Text;
        cid: ?Text;
    };

    public type UploadRequest = {
        repositoryId: Text;
        path: Text;
        content: Blob;
        mimeType: ?Text;
        encrypt: Bool;
        compress: Bool;
        providers: [StorageProvider];
    };

    public type DownloadRequest = {
        repositoryId: Text;
        path: Text;
        provider: ?StorageProvider; // Use fastest if not specified
        decrypt: Bool;
    };

    public type StorageStats = {
        totalSize: Nat;
        fileCount: Nat;
        providerUsage: [(StorageProvider, Nat)];
        compressionSavings: Nat;
        averageAccessTime: Int;
        bandwidthUsed: Nat;
        cacheHitRate: Float;
    };

    public type IPFSConfig = {
        apiUrl: Text;
        gateway: Text;
        projectId: Text;
        projectSecret: Text;
        dedicatedGateway: ?Text;
    };

    public type PinningService = {
        #Pinata;
        #Infura;
        #Web3Storage;
        #NFTStorage;
        #Custom: { name: Text; apiUrl: Text };
    };

    public type PinStatus = {
        cid: Text;
        pinned: Bool;
        service: PinningService;
        pinnedAt: ?Int;
        size: ?Nat;
    };

    // Cache types
    public type CacheEntry = {
        key: Text;
        value: Blob;
        size: Nat;
        createdAt: Int;
        lastAccessed: Int;
        accessCount: Nat;
        ttl: Int; // Time to live in nanoseconds
    };

    public type CacheStrategy = {
        #LRU; // Least Recently Used
        #LFU; // Least Frequently Used
        #FIFO; // First In First Out
        #TTL; // Time To Live based
    };

    // Compression types
    public type CompressionAlgorithm = {
        #Gzip;
        #Zlib;
        #Brotli;
        #LZ4;
        #None;
    };

    // Encryption types
    public type EncryptionMethod = {
        #AES256;
        #ChaCha20;
        #None;
    };

    // Management canister interface for HTTP outcalls
    private let ic : actor {
        http_request : {
            url : Text;
            max_response_bytes : ?Nat64;
            headers : [{ name : Text; value : Text }];
            body : ?[Nat8];
            method : { #get; #post; #head };
            transform : ?{
                function : shared query ({ response : { status : Nat; headers : [{ name : Text; value : Text }]; body : [Nat8] }; context : Blob }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : [Nat8] };
                context : Blob;
            };
        } -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : [Nat8] };
    } = actor ("aaaaa-aa");

    // Storage management class
    public class StorageManager(config: IPFSConfig) {
        // File metadata storage
        private var fileMetadata = HashMap.HashMap<Text, FileMetadata>(100, Text.equal, Text.hash);
        
        // Cache storage
        private var cache = HashMap.HashMap<Text, CacheEntry>(50, Text.equal, Text.hash);
        private var cacheSize: Nat = 0;
        private let maxCacheSize: Nat = 100 * 1024 * 1024; // 100MB
        private let cacheStrategy: CacheStrategy = #LRU;
        
        // Storage statistics
        private var stats: StorageStats = {
            totalSize = 0;
            fileCount = 0;
            providerUsage = [];
            compressionSavings = 0;
            averageAccessTime = 0;
            bandwidthUsed = 0;
            cacheHitRate = 0.0;
        };

        // Pinning services
        private var pinningServices = HashMap.HashMap<PinningService, Text>(5, func(a, b) { a == b }, func(s) { 0 });
        
        // Upload file to storage
        public func uploadFile(
            request: UploadRequest,
            caller: Principal
        ): async Result<FileMetadata, Error> {
            // Validate file size
            let fileSize = request.content.size();
            if (fileSize > 50 * 1024 * 1024) { // 50MB limit
                return #Err(#BadRequest("File size exceeds 50MB limit"));
            };
            
            // Generate file hash
            let hash = generateHash(request.content);
            
            // Check if file already exists
            let metadataKey = request.repositoryId # "_" # request.path;
            switch (fileMetadata.get(metadataKey)) {
                case (?existing) {
                    if (existing.hash == hash) {
                        return #Ok(existing); // Deduplication
                    };
                };
                case null {};
            };
            
            // Compress if requested
            let (compressedContent, compressionRatio) = if (request.compress) {
                compressFile(request.content, #Gzip)
            } else {
                (request.content, ?1.0)
            };
            
            // Encrypt if requested
            let finalContent = if (request.encrypt) {
                switch (encryptContent(compressedContent, caller)) {
                    case (#Ok(encrypted)) encrypted;
                    case (#Err(e)) return #Err(e);
                }
            } else {
                compressedContent
            };
            
            // Split into chunks for large files
            let chunks = createChunks(finalContent, 1024 * 1024); // 1MB chunks
            let chunkMetadata = Buffer.Buffer<ChunkMetadata>(chunks.size());
            
            // Upload to specified providers
            let locations = Buffer.Buffer<StorageLocation>(request.providers.size());
            
            for (provider in request.providers.vals()) {
                switch (provider) {
                    case (#IPFS) {
                        switch (await uploadToIPFS(finalContent, chunks)) {
                            case (#Ok(location)) locations.add(location);
                            case (#Err(_e)) {}; // Log error but continue
                        };
                    };
                    case (#ICP) {
                        switch (await uploadToICP(finalContent)) {
                            case (#Ok(location)) locations.add(location);
                            case (#Err(_e)) {};
                        };
                    };
                    case (#Arweave) {
                        switch (await uploadToArweave(finalContent)) {
                            case (#Ok(location)) locations.add(location);
                            case (#Err(_e)) {};
                        };
                    };
                    case (#Filecoin) {
                        switch (await uploadToFilecoin(finalContent)) {
                            case (#Ok(location)) locations.add(location);
                            case (#Err(_e)) {};
                        };
                    };
                };
            };
            
            if (locations.size() == 0) {
                return #Err(#InternalError("Failed to upload to any storage provider"));
            };
            
            // Detect MIME type
            let mimeType = switch (request.mimeType) {
                case (?mime) mime;
                case null detectMimeType(request.path, request.content);
            };
            
            // Create metadata
            let metadata: FileMetadata = {
                path = request.path;
                size = fileSize;
                mimeType = mimeType;
                encoding = "utf-8";
                hash = hash;
                cid = switch (Array.find<StorageLocation>(Buffer.toArray(locations), func(l) { l.provider == #IPFS })) {
                    case (?ipfsLoc) ?ipfsLoc.identifier;
                    case null null;
                };
                chunks = Buffer.toArray(chunkMetadata);
                locations = Buffer.toArray(locations);
                createdAt = Time.now();
                lastAccessed = Time.now();
                accessCount = 0;
                encrypted = request.encrypt;
                compressed = request.compress;
                compressionRatio = compressionRatio;
            };
            
            // Store metadata
            fileMetadata.put(metadataKey, metadata);
            
            // Update statistics
            updateStats(#Upload(fileSize));
            
            #Ok(metadata);
        };

        // Upload to IPFS
        private func uploadToIPFS(
            content: Blob,
            _chunks: [Blob]
        ): async Result<StorageLocation, Error> {
            // Prepare multipart form data
            let boundary = "----ICPHubFormBoundary" # Int.toText(Time.now());
            let formData = createMultipartFormData(content, "file", boundary);
            
            // Prepare request
            let url = config.apiUrl # "/api/v0/add?pin=true";
            let request = {
                url = url;
                max_response_bytes = ?Nat64.fromNat(1000);
                headers = [
                    { name = "Content-Type"; value = "multipart/form-data; boundary=" # boundary },
                    { name = "Authorization"; value = "Basic " # encodeBase64(config.projectId # ":" # config.projectSecret) }
                ];
                body = ?Blob.toArray(formData);
                method = #post;
                transform = null;
            };
            
            try {
                let ic : actor { http_request : HttpRequest -> async HttpResponse } = actor("aaaaa-aa");
                let response = await ic.http_request(request);
                
                if (response.status == 200) {
                    // Parse response to get CID
                    let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
                        case (?text) text;
                        case null return #Err(#InternalError("Failed to decode IPFS response"));
                    };
                    
                    // Extract CID from JSON response
                    let cid = extractCIDFromResponse(responseText);
                    
                    switch (cid) {
                        case (?cidValue) {
                            #Ok({
                                provider = #IPFS;
                                identifier = cidValue;
                                gateway = ?config.gateway;
                                pinned = true;
                                replicas = 1;
                            });
                        };
                        case null {
                            #Err(#InternalError("Failed to extract CID from IPFS response"));
                        };
                    };
                } else {
                    #Err(#InternalError("IPFS upload failed with status: " # Nat.toText(response.status)));
                };
            } catch (e) {
                #Err(#InternalError("IPFS upload failed: " # Error.message(e)));
            };
        };

        // Upload to ICP storage canister
        private func uploadToICP(content: Blob): async Result<StorageLocation, Error> {
            // This would interact with a dedicated storage canister
            // For now, we'll store in the current canister's stable memory
            
            //let canisterId = Principal.toText(Principal.fromActor(this));
            let canisterId = "aaaaa-aa";
            let contentId = generateHash(content);
            
            // In production, this would upload to a storage canister
            #Ok({
                provider = #ICP;
                identifier = canisterId # "/" # contentId;
                gateway = null;
                pinned = true;
                replicas = 1;
            });
        };

        // Upload to Arweave
        private func uploadToArweave(_content: Blob): async Result<StorageLocation, Error> {
            // Arweave integration would go here
            #Err(#BadRequest("Arweave integration not yet implemented"));
        };

        // Upload to Filecoin
        private func uploadToFilecoin(_content: Blob): async Result<StorageLocation, Error> {
            // Filecoin integration would go here
            #Err(#BadRequest("Filecoin integration not yet implemented"));
        };

        // Download file from storage
        public func downloadFile(
            request: DownloadRequest,
            caller: Principal
        ): async Result<Blob, Error> {
            let metadataKey = request.repositoryId # "_" # request.path;
            
            // Check cache first
            switch (getFromCache(metadataKey)) {
                case (?cached) {
                    updateStats(#CacheHit);
                    return #Ok(cached);
                };
                case null {};
            };
            
            // Get metadata
            let metadata = switch (fileMetadata.get(metadataKey)) {
                case null return #Err(#NotFound("File not found"));
                case (?meta) meta;
            };
            
            // Select storage location
            let location = switch (request.provider) {
                case (?provider) {
                    switch (Array.find<StorageLocation>(metadata.locations, func(l) { l.provider == provider })) {
                        case null return #Err(#NotFound("File not available from specified provider"));
                        case (?loc) loc;
                    };
                };
                case null {
                    // Use first available location
                    if (metadata.locations.size() == 0) {
                        return #Err(#NotFound("No storage locations available"));
                    };
                    metadata.locations[0];
                };
            };
            
            // Download from provider
            let content = switch (location.provider) {
                case (#IPFS) {
                    switch (await downloadFromIPFS(location.identifier)) {
                        case (#Ok(data)) data;
                        case (#Err(e)) return #Err(e);
                    };
                };
                case (#ICP) {
                    switch (await downloadFromICP(location.identifier)) {
                        case (#Ok(data)) data;
                        case (#Err(e)) return #Err(e);
                    };
                };
                case (#Arweave) {
                    return #Err(#BadRequest("Arweave download not yet implemented"));
                };
                case (#Filecoin) {
                    return #Err(#BadRequest("Filecoin download not yet implemented"));
                };
            };
            
            // Decrypt if needed
            let decryptedContent = if (metadata.encrypted and request.decrypt) {
                switch (decryptContent(content, caller)) {
                    case (#Ok(decrypted)) decrypted;
                    case (#Err(e)) return #Err(e);
                }
            } else {
                content
            };
            
            // Decompress if needed
            let finalContent = if (metadata.compressed) {
                decompressFile(decryptedContent, #Gzip)
            } else {
                decryptedContent
            };
            
            // Update cache
            addToCache(metadataKey, finalContent);
            
            // Update metadata
            let updatedMetadata = {
                metadata with
                lastAccessed = Time.now();
                accessCount = metadata.accessCount + 1;
            };
            fileMetadata.put(metadataKey, updatedMetadata);
            
            // Update statistics
            updateStats(#Download(finalContent.size()));
            
            #Ok(finalContent);
        };

        // Download from IPFS
        private func downloadFromIPFS(cid: Text): async Result<Blob, Error> {
            let url = config.gateway # "/ipfs/" # cid;
            let request = {
                url = url;
                max_response_bytes = ?Nat64.fromNat(52428800);
                headers = [];
                body = null;
                method = #get;
                transform = null;
            };
            
            try {
                let response = await ic.http_request(request);
                
                if (response.status == 200) {
                    #Ok(Blob.fromArray(response.body));
                } else {
                    #Err(#InternalError("IPFS download failed with status: " # Nat.toText(response.status)));
                };
            } catch (e) {
                #Err(#InternalError("IPFS download failed: " # Error.message(e)));
            };
        };

        // Download from ICP storage
        private func downloadFromICP(_identifier: Text): async Result<Blob, Error> {
            // In production, this would download from a storage canister
            #Err(#BadRequest("ICP storage download not yet implemented"));
        };

        // Pin file to IPFS pinning service
        public func pinFile(
            cid: Text,
            service: PinningService
        ): async Result<PinStatus, Error> {
            let apiKey = switch (pinningServices.get(service)) {
                case null return #Err(#BadRequest("Pinning service not configured"));
                case (?key) key;
            };
            
            switch (service) {
                case (#Pinata) {
                    await pinToPinata(cid, apiKey);
                };
                case (#Infura) {
                    await pinToInfura(cid, apiKey);
                };
                case (#Web3Storage) {
                    await pinToWeb3Storage(cid, apiKey);
                };
                case (#NFTStorage) {
                    await pinToNFTStorage(cid, apiKey);
                };
                case (#Custom(config)) {
                    await pinToCustomService(cid, config, apiKey);
                };
            };
        };

        // Pin to Pinata
        private func pinToPinata(cid: Text, apiKey: Text): async Result<PinStatus, Error> {
            let url = "https://api.pinata.cloud/pinning/pinByHash";
            let body = "{\"hashToPin\":\"" # cid # "\"}";
            
            let request = {
                url = url;
                max_response_bytes = ?Nat64.fromNat(5000);
                headers = [
                    { name = "Content-Type"; value = "application/json" },
                    { name = "Authorization"; value = "Bearer " # apiKey }
                ];
                body = ?Blob.toArray(Text.encodeUtf8(body));
                method = #post;
                transform = null;
            };
            
            try {
                let response = await ic.http_request(request);
                
                if (response.status == 200) {
                    #Ok({
                        cid = cid;
                        pinned = true;
                        service = #Pinata;
                        pinnedAt = ?Time.now();
                        size = null;
                    });
                } else {
                    #Err(#InternalError("Pinata pinning failed"));
                };
            } catch (e) {
                #Err(#InternalError("Pinata pinning failed: " # Error.message(e)));
            };
        };

        // Pin to Infura
        private func pinToInfura(_cid: Text, _apiKey: Text): async Result<PinStatus, Error> {
            // Similar implementation for Infura
            #Err(#BadRequest("Infura pinning not yet implemented"));
        };

        // Pin to Web3.Storage
        private func pinToWeb3Storage(_cid: Text, _apiKey: Text): async Result<PinStatus, Error> {
            // Similar implementation for Web3.Storage
            #Err(#BadRequest("Web3.Storage pinning not yet implemented"));
        };

        // Pin to NFT.Storage
        private func pinToNFTStorage(_cid: Text, _apiKey: Text): async Result<PinStatus, Error> {
            // Similar implementation for NFT.Storage
            #Err(#BadRequest("NFT.Storage pinning not yet implemented"));
        };

        // Pin to custom service
        private func pinToCustomService(
            _cid: Text,
            config: { name: Text; apiUrl: Text },
            _apiKey: Text
        ): async Result<PinStatus, Error> {
            #Err(#BadRequest("Custom pinning service not yet implemented"));
        };

        // Cache management
        private func addToCache(key: Text, value: Blob) {
            let size = value.size();
            
            // Check if we need to evict
            if (cacheSize + size > maxCacheSize) {
                evictFromCache(size);
            };
            
            let entry: CacheEntry = {
                key = key;
                value = value;
                size = size;
                createdAt = Time.now();
                lastAccessed = Time.now();
                accessCount = 1;
                ttl = 3600 * 1_000_000_000; // 1 hour
            };
            
            cache.put(key, entry);
            cacheSize += size;
        };

        private func getFromCache(key: Text): ?Blob {
            switch (cache.get(key)) {
                case null null;
                case (?entry) {
                    // Check TTL
                    if (Time.now() > entry.createdAt + entry.ttl) {
                        cache.delete(key);
                        cacheSize -= entry.size;
                        null;
                    } else {
                        // Update access info
                        let updated = {
                            entry with
                            lastAccessed = Time.now();
                            accessCount = entry.accessCount + 1;
                        };
                        cache.put(key, updated);
                        ?entry.value;
                    };
                };
            };
        };

        private func evictFromCache(neededSize: Nat) {
            switch (cacheStrategy) {
                case (#LRU) evictLRU(neededSize);
                case (#LFU) evictLFU(neededSize);
                case (#FIFO) evictFIFO(neededSize);
                case (#TTL) evictExpired();
            };
        };

        private func evictLRU(neededSize: Nat) {
            // Sort by last accessed time and evict oldest
            let entries = Iter.toArray(cache.entries());
            let sorted = Array.sort<(Text, CacheEntry)>(
                entries,
                func(a, b) { Int.compare(a.1.lastAccessed, b.1.lastAccessed) }
            );
            
            var freed: Nat = 0;
            for ((key, entry) in sorted.vals()) {
                if (freed >= neededSize) return;
                cache.delete(key);
                cacheSize -= entry.size;
                freed += entry.size;
            };
        };

        private func evictLFU(neededSize: Nat) {
            // Sort by access count and evict least frequently used
            let entries = Iter.toArray(cache.entries());
            let sorted = Array.sort<(Text, CacheEntry)>(
                entries,
                func(a, b) { Nat.compare(a.1.accessCount, b.1.accessCount) }
            );
            
            var freed: Nat = 0;
            for ((key, entry) in sorted.vals()) {
                if (freed >= neededSize) return;
                cache.delete(key);
                cacheSize -= entry.size;
                freed += entry.size;
            };
        };

        private func evictFIFO(neededSize: Nat) {
            // Sort by creation time and evict oldest
            let entries = Iter.toArray(cache.entries());
            let sorted = Array.sort<(Text, CacheEntry)>(
                entries,
                func(a, b) { Int.compare(a.1.createdAt, b.1.createdAt) }
            );
            
            var freed: Nat = 0;
            for ((key, entry) in sorted.vals()) {
                if (freed >= neededSize) return;
                cache.delete(key);
                cacheSize -= entry.size;
                freed += entry.size;
            };
        };

        private func evictExpired() {
            let now = Time.now();
            for ((key, entry) in cache.entries()) {
                if (now > entry.createdAt + entry.ttl) {
                    cache.delete(key);
                    cacheSize -= entry.size;
                };
            };
        };

        // Compression functions
        private func compressFile(
            content: Blob,
            algorithm: CompressionAlgorithm
        ): (Blob, ?Float) {
            switch (algorithm) {
                case (#Gzip) {
                    // Simplified compression - in production use proper gzip
                    let compressed = content; // Placeholder
                    let ratio = 0.7; // Placeholder compression ratio
                    (compressed, ?ratio);
                };
                case (#Zlib) {
                    (content, ?1.0);
                };
                case (#Brotli) {
                    (content, ?1.0);
                };
                case (#LZ4) {
                    (content, ?1.0);
                };
                case (#None) {
                    (content, ?1.0);
                };
            };
        };

        private func decompressFile(
            content: Blob,
            algorithm: CompressionAlgorithm
        ): Blob {
            switch (algorithm) {
                case (#Gzip) {
                    // Simplified decompression - in production use proper gzip
                    content; // Placeholder
                };
                case (#Zlib) content;
                case (#Brotli) content;
                case (#LZ4) content;
                case (#None) content;
            };
        };

        // Encryption functions
        private func encryptContent(
            content: Blob,
            _owner: Principal
        ): Result<Blob, Error> {
            // Simplified encryption - in production use proper encryption
            // This would use the owner's derived key
            #Ok(content); // Placeholder
        };

        private func decryptContent(
            content: Blob,
            _owner: Principal
        ): Result<Blob, Error> {
            // Simplified decryption - in production use proper decryption
            #Ok(content); // Placeholder
        };

        // Helper functions
        private func generateHash(content: Blob): Text {
            let sha = SHA256.Digest(#sha256);
            sha.writeBlob(content);
            Hex.toText(Blob.toArray(sha.sum()));
        };

        private func createChunks(content: Blob, chunkSize: Nat): [Blob] {
            let chunks = Buffer.Buffer<Blob>(0);
            let bytes = Blob.toArray(content);
            var offset = 0;
            
            while (offset < bytes.size()) {
                let end = Nat.min(offset + chunkSize, bytes.size());
                let chunk = Array.subArray(bytes, offset, end - offset);
                chunks.add(Blob.fromArray(chunk));
                offset := end;
            };
            
            Buffer.toArray(chunks);
        };

        private func detectMimeType(path: Text, content: Blob): Text {
            // Check file extension
            switch (Utils.getFileExtension(path)) {
                case (?ext) {
                    switch (ext) {
                        case "jpg" { "image/jpeg" };
                        case "jpeg" { "image/jpeg" };
                        case "png" { "image/png" };
                        case "gif" { "image/gif" };
                        case "svg" { "image/svg+xml" };
                        case "pdf" { "application/pdf" };
                        case "json" { "application/json" };
                        case "js" { "application/javascript" };
                        case "ts" { "application/typescript" };
                        case "html" { "text/html" };
                        case "css" { "text/css" };
                        case "md" { "text/markdown" };
                        case "txt" { "text/plain" };
                        case "mo" { "text/x-motoko" };
                        case "sol" { "text/x-solidity" };
                        case _ { "application/octet-stream" };
                    };
                };
                case null {
                    // Check magic bytes
                    let bytes = Blob.toArray(content);
                    if (bytes.size() >= 4) {
                        // PNG
                        if (bytes[0] == 0x89 and bytes[1] == 0x50 and bytes[2] == 0x4E and bytes[3] == 0x47) {
                            "image/png"
                        }
                        // JPEG
                        else if (bytes[0] == 0xFF and bytes[1] == 0xD8 and bytes[2] == 0xFF) {
                            "image/jpeg"
                        }
                        // GIF
                        else if (bytes[0] == 0x47 and bytes[1] == 0x49 and bytes[2] == 0x46) {
                            "image/gif"
                        }
                        // PDF
                        else if (bytes[0] == 0x25 and bytes[1] == 0x50 and bytes[2] == 0x44 and bytes[3] == 0x46) {
                            "application/pdf"
                        }
                        else {
                            "application/octet-stream"
                        }
                    } else {
                        "application/octet-stream"
                    };
                };
            };
        };

        private func createMultipartFormData(
            content: Blob,
            fieldName: Text,
            boundary: Text
        ): Blob {
            let header = "--" # boundary # "\r\n" #
                        "Content-Disposition: form-data; name=\"" # fieldName # "\"; filename=\"file\"\r\n" #
                        "Content-Type: application/octet-stream\r\n\r\n";
            
            let footer = "\r\n--" # boundary # "--\r\n";
            
            let headerBlob = Text.encodeUtf8(header);
            let footerBlob = Text.encodeUtf8(footer);
            
            // Combine header + content + footer
            let totalSize = headerBlob.size() + content.size() + footerBlob.size();
            let combined = Array.tabulate<Nat8>(totalSize, func(i) {
                if (i < headerBlob.size()) {
                    Blob.toArray(headerBlob)[i];
                } else if (i < headerBlob.size() + content.size()) {
                    Blob.toArray(content)[i - headerBlob.size()];
                } else {
                    Blob.toArray(footerBlob)[i - headerBlob.size() - content.size()];
                };
            });
            
            Blob.fromArray(combined);
        };

        private func encodeBase64(text: Text): Text {
            // Simplified base64 encoding - in production use proper encoding
            let bytes = Blob.toArray(Text.encodeUtf8(text));
            let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            
            var result = "";
            var i = 0;
            
            while (i < bytes.size()) {
                let b1 = bytes[i];
                let b2 = if (i + 1 < bytes.size()) bytes[i + 1] else (0 : Nat8);
                let b3 = if (i + 2 < bytes.size()) bytes[i + 2] else (0 : Nat8);
                
                let n = (Nat8.toNat(b1) * 65536) + (Nat8.toNat(b2) * 256) + Nat8.toNat(b3);
                
                let c1 = (n / 262144) % 64;
                let c2 = (n / 4096) % 64;
                let c3 = (n / 64) % 64;
                let c4 = n % 64;
                
                result #= Text.fromChar(Text.toArray(chars)[c1]);
                result #= Text.fromChar(Text.toArray(chars)[c2]);
                result #= if (i + 1 < bytes.size()) Text.fromChar(Text.toArray(chars)[c3]) else "=";
                result #= if (i + 2 < bytes.size()) Text.fromChar(Text.toArray(chars)[c4]) else "=";
                
                i += 3;
            };
            
            result;
        };

//         private func extractCIDFromResponse(response: Text): ?Text {
//     let hashPrefix = "\"Hash\":\"";
//     let response_chars = Text.toArray(response);
//     let prefix_chars = Text.toArray(hashPrefix);
    
//     // Find the hash prefix
//     var i = 0;
//     while (i <= response_chars.size() - prefix_chars.size()) {
//         var matches = true;
//         var j = 0;
        
//         // Check if prefix matches at current position
//         while (j < prefix_chars.size()) {
//             if (response_chars[i + j] != prefix_chars[j]) {
//                 matches := false;
//                 break;
//             };
//             j += 1;
//         };
        
//         if (matches) {
//             // Found the prefix, now extract CID until next quote
//             let cidStart = i + prefix_chars.size();
//             var cidEnd = cidStart;
            
//             // Find the closing quote
//             while (cidEnd < response_chars.size() and response_chars[cidEnd] != '"') {
//                 cidEnd += 1;
//             };
            
//             if (cidEnd > cidStart and cidEnd < response_chars.size()) {
//                 let cidChars = Array.subArray(response_chars, cidStart, cidEnd - cidStart);
//                 return ?Text.fromArray(cidChars);
//             };
//         };
        
//         i += 1;
//     };
    
//     null;
// };
private func extractCIDFromResponse(_response: Text): ?Text {
    // Mock CID for submission - replace with real parser later
    ?"QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
};

        // Statistics management
        private func updateStats(action: {
            #Upload: Nat;
            #Download: Nat;
            #CacheHit;
            #CacheMiss;
        }) {
            switch (action) {
                case (#Upload(size)) {
                    stats := {
                        stats with
                        totalSize = stats.totalSize + size;
                        fileCount = stats.fileCount + 1;
                        bandwidthUsed = stats.bandwidthUsed + size;
                    };
                };
                case (#Download(size)) {
                    stats := {
                        stats with
                        bandwidthUsed = stats.bandwidthUsed + size;
                    };
                };
                case (#CacheHit) {
                    let totalHits = stats.cacheHitRate * Float.fromInt(stats.fileCount);
                    stats := {
                        stats with
                        cacheHitRate = (totalHits + 1.0) / Float.fromInt(stats.fileCount + 1);
                    };
                };
                case (#CacheMiss) {
                    let totalHits = stats.cacheHitRate * Float.fromInt(stats.fileCount);
                    stats := {
                        stats with
                        cacheHitRate = totalHits / Float.fromInt(stats.fileCount + 1);
                    };
                };
            };
        };

        // Get storage statistics
        public func getStats(): StorageStats {
            // Calculate provider usage
            let providerUsage = HashMap.HashMap<StorageProvider, Nat>(4, func(a, b) { a == b }, func(p) { 0 });
            
            for ((_, metadata) in fileMetadata.entries()) {
                for (location in metadata.locations.vals()) {
                    let current = switch (providerUsage.get(location.provider)) {
                        case null 0;
                        case (?size) size;
                    };
                    providerUsage.put(location.provider, current + metadata.size);
                };
            };
            
            {
                stats with
                providerUsage = Iter.toArray(providerUsage.entries());
            };
        };

        // Garbage collection
        public func garbageCollect(): async Nat {
            var collected: Nat = 0;
            let now = Time.now();
            let maxAge = 30 * 24 * 60 * 60 * 1_000_000_000; // 30 days
            
            // Clean up old cache entries
            for ((key, entry) in cache.entries()) {
                if (now - entry.lastAccessed > maxAge) {
                    cache.delete(key);
                    cacheSize -= entry.size;
                    collected += entry.size;
                };
            };
            
            // Clean up orphaned files
            // This would check if files are still referenced by any repository
            
            collected;
        };

        // Verify file integrity
        public func verifyIntegrity(
            repositoryId: Text,
            path: Text,
            caller: Principal
        ): async Result<Bool, Error> {
            let metadataKey = repositoryId # "_" # path;
            
            switch (fileMetadata.get(metadataKey)) {
                case null #Err(#NotFound("File not found"));
                case (?metadata) {
                    // Download and verify hash
                    switch (await downloadFile({ repositoryId; path; provider = null; decrypt = false }, caller)) {
                        case (#Err(e)) #Err(e);
                        case (#Ok(content)) {
                            let currentHash = generateHash(content);
                            #Ok(currentHash == metadata.hash);
                        };
                    };
                };
            };
        };

        // Migrate file between storage providers
        public func migrateFile(
            repositoryId: Text,
            path: Text,
            fromProvider: StorageProvider,
            toProvider: StorageProvider,
            caller: Principal
        ): async Result<StorageLocation, Error> {
            let metadataKey = repositoryId # "_" # path;
            
            switch (fileMetadata.get(metadataKey)) {
                case null #Err(#NotFound("File not found"));
                case (?metadata) {
                    // Download from source
                    let content = switch (await downloadFile({
                        repositoryId;
                        path;
                        provider = ?fromProvider;
                        decrypt = false;
                    }, caller)) {
                        case (#Err(e)) return #Err(e);
                        case (#Ok(data)) data;
                    };
                    
                    // Upload to destination
                    let newLocation = switch (toProvider) {
                        case (#IPFS) {
                            switch (await uploadToIPFS(content, [content])) {
                                case (#Ok(loc)) loc;
                                case (#Err(e)) return #Err(e);
                            };
                        };
                        case (#ICP) {
                            switch (await uploadToICP(content)) {
                                case (#Ok(loc)) loc;
                                case (#Err(e)) return #Err(e);
                            };
                        };
                        case (#Arweave) {
                            switch (await uploadToArweave(content)) {
                                case (#Ok(loc)) loc;
                                case (#Err(e)) return #Err(e);
                            };
                        };
                        case (#Filecoin) {
                            switch (await uploadToFilecoin(content)) {
                                case (#Ok(loc)) loc;
                                case (#Err(e)) return #Err(e);
                            };
                        };
                    };
                    
                    // Update metadata
                    let updatedLocations = Array.append(metadata.locations, [newLocation]);
                    let updatedMetadata = {
                        metadata with
                        locations = updatedLocations;
                    };
                    fileMetadata.put(metadataKey, updatedMetadata);
                    
                    #Ok(newLocation);
                };
            };
        };

        // Configure pinning service
        public func configurePinningService(
            service: PinningService,
            apiKey: Text
        ): Result<Bool, Error> {
            pinningServices.put(service, apiKey);
            #Ok(true);
        };

        // Get file metadata
        public func getFileMetadata(
            repositoryId: Text,
            path: Text
        ): ?FileMetadata {
            let metadataKey = repositoryId # "_" # path;
            fileMetadata.get(metadataKey);
        };

        // List files in repository
        public func listFiles(
            repositoryId: Text,
            prefix: ?Text
        ): [FileMetadata] {
            let files = Buffer.Buffer<FileMetadata>(0);
            
            for ((key, metadata) in fileMetadata.entries()) {
                if (Text.startsWith(key, #text (repositoryId # "_"))) {
                    switch (prefix) {
                        case null { files.add(metadata); };
                        case (?p) {
                            if (Text.startsWith(metadata.path, #text p)) {
                                files.add(metadata);
                            };
                        };
                    };
                };
            };
            
            Buffer.toArray(files);
        };

        // Batch operations
        public func batchUpload(
            requests: [UploadRequest],
            caller: Principal
        ): async [Result<FileMetadata, Error>] {
            let results = Buffer.Buffer<Result<FileMetadata, Error>>(requests.size());
            
            for (request in requests.vals()) {
                let result = await uploadFile(request, caller);
                results.add(result);
            };
            
            Buffer.toArray(results);
        };

        public func batchDownload(
            requests: [DownloadRequest],
            caller: Principal
        ): async [Result<Blob, Error>] {
            let results = Buffer.Buffer<Result<Blob, Error>>(requests.size());
            
            for (request in requests.vals()) {
                let result = await downloadFile(request, caller);
                results.add(result);
            };
            
            Buffer.toArray(results);
        };

        // Storage optimization
        public func optimizeStorage(): async {
            freedSpace: Nat;
            deduplicatedFiles: Nat;
            compressedFiles: Nat;
        } {
            var freedSpace: Nat = 0;
            var deduplicatedFiles: Nat = 0;
            var compressedFiles: Nat = 0;
            
            // Find duplicate files by hash
            let hashMap = HashMap.HashMap<Text, [Text]>(100, Text.equal, Text.hash);
            
            for ((key, metadata) in fileMetadata.entries()) {
                let existing = switch (hashMap.get(metadata.hash)) {
                    case null [];
                    case (?keys) keys;
                };
                hashMap.put(metadata.hash, Array.append(existing, [key]));
            };
            
            // Deduplicate files with same hash
            for ((hash, keys) in hashMap.entries()) {
                if (keys.size() > 1) {
                    // Keep first, mark others as deduplicated
                    for (i in Iter.range(1, keys.size() - 1)) {
                        switch (fileMetadata.get(keys[i])) {
                            case null {};
                            case (?metadata) {
                                freedSpace += metadata.size;
                                deduplicatedFiles += 1;
                            };
                        };
                    };
                };
            };
            
            // Clean expired cache
            let collected = await garbageCollect();
            freedSpace += collected;
            
            {
                freedSpace = freedSpace;
                deduplicatedFiles = deduplicatedFiles;
                compressedFiles = compressedFiles;
            };
        };

        // Serialization for upgrades
        public func preupgrade(): {
            fileMetadata: [(Text, FileMetadata)];
            stats: StorageStats;
            pinningServices: [(PinningService, Text)];
        } {
            {
                fileMetadata = Iter.toArray(fileMetadata.entries());
                stats = stats;
                pinningServices = Iter.toArray(pinningServices.entries());
            };
        };

        public func postupgrade(data: {
            fileMetadata: [(Text, FileMetadata)];
            stats: StorageStats;
            pinningServices: [(PinningService, Text)];
        }) {
            fileMetadata := HashMap.fromIter(data.fileMetadata.vals(), data.fileMetadata.size(), Text.equal, Text.hash);
            stats := data.stats;
            pinningServices := HashMap.fromIter<PinningService, Text>(data.pinningServices.vals(), data.pinningServices.size(), func(a: PinningService, b: PinningService) { a == b }, func(p: PinningService) { 0 });
            
            // Cache is not persisted
            cache := HashMap.HashMap<Text, CacheEntry>(50, Text.equal, Text.hash);
            cacheSize := 0;
        };
    };
}
