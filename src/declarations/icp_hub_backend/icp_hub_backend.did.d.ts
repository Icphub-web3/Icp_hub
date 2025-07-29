import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CreateRepositoryRequest {
  'name' : string,
  'description' : [] | [string],
  'isPrivate' : boolean,
  'license' : [] | [string],
}
export type Error = { 'NotFound' : string } |
  { 'Unauthorized' : string } |
  { 'InternalError' : string } |
  { 'Forbidden' : string } |
  { 'BadRequest' : string } |
  { 'Conflict' : string };
export interface FileEntry {
  'commitMessage' : [] | [string],
  'content' : Uint8Array | number[],
  'hash' : string,
  'path' : string,
  'size' : bigint,
  'author' : Principal,
  'lastModified' : bigint,
  'version' : bigint,
}
export interface FileListResponse {
  'files' : Array<FileEntry>,
  'path' : string,
  'totalCount' : bigint,
}
export interface MemoryStats {
  'heapSize' : bigint,
  'availableMemory' : bigint,
  'cycles' : bigint,
  'usedMemory' : bigint,
  'totalMemory' : bigint,
}
export interface PaginationParams { 'page' : bigint, 'limit' : bigint }
export interface RegisterUserRequest {
  'username' : string,
  'email' : [] | [string],
  'profile' : UserProfile,
}
export interface RepositoryListResponse {
  'repositories' : Array<SerializableRepository>,
  'hasMore' : boolean,
  'totalCount' : bigint,
}
export type Result = { 'Ok' : FileEntry } |
  { 'Err' : Error };
export type Result_1 = { 'Ok' : User } |
  { 'Err' : Error };
export type Result_2 = { 'Ok' : string } |
  { 'Err' : Error };
export type Result_3 = { 'Ok' : RepositoryListResponse } |
  { 'Err' : Error };
export type Result_4 = { 'Ok' : FileListResponse } |
  { 'Err' : Error };
export type Result_5 = { 'Ok' : SerializableRepository } |
  { 'Err' : Error };
export type Result_6 = { 'Ok' : Array<[string, string]> } |
  { 'Err' : Error };
export type Result_7 = { 'Ok' : Array<Principal> } |
  { 'Err' : Error };
export interface SerializableRepository {
  'id' : string,
  'files' : Array<[string, FileEntry]>,
  'forks' : bigint,
  'owner' : Principal,
  'name' : string,
  'createdAt' : bigint,
  'size' : bigint,
  'description' : [] | [string],
  'language' : [] | [string],
  'updatedAt' : bigint,
  'stars' : bigint,
  'isPrivate' : boolean,
}
export interface UploadFileRequest {
  'repositoryId' : string,
  'commitMessage' : string,
  'content' : Uint8Array | number[],
  'path' : string,
}
export interface User {
  'repositories' : Array<string>,
  'principal' : Principal,
  'username' : string,
  'createdAt' : bigint,
  'email' : [] | [string],
  'updatedAt' : bigint,
  'profile' : UserProfile,
}
export interface UserProfile {
  'bio' : [] | [string],
  'externalLinks' : Array<[string, string]>,
  'displayName' : [] | [string],
  'socialLinks' : Array<[string, string]>,
  'website' : [] | [string],
  'skills' : Array<string>,
  'location' : [] | [string],
  'avatar' : [] | [Uint8Array | number[]],
}
export interface _SERVICE {
  'addCollaborator' : ActorMethod<[string, Principal], Result_2>,
  'createRepository' : ActorMethod<[CreateRepositoryRequest], Result_5>,
  'forkRepository' : ActorMethod<[string, [] | [string]], Result_5>,
  'getCollaborators' : ActorMethod<[string], Result_7>,
  'getFile' : ActorMethod<[string, string], Result>,
  'getLinkedAccounts' : ActorMethod<[], Result_6>,
  'getMemoryStats' : ActorMethod<[], MemoryStats>,
  'getRepository' : ActorMethod<[string], Result_5>,
  'getUser' : ActorMethod<[Principal], Result_1>,
  'health' : ActorMethod<[], boolean>,
  'linkExternalAccount' : ActorMethod<[string, string], Result_2>,
  'listFiles' : ActorMethod<[string, [] | [string]], Result_4>,
  'listUserRepositories' : ActorMethod<
    [[] | [string], [] | [PaginationParams]],
    Result_3
  >,
  'registerUser' : ActorMethod<[RegisterUserRequest], Result_1>,
  'starRepository' : ActorMethod<[string], Result_2>,
  'unstarRepository' : ActorMethod<[string], Result_2>,
  'updateProfile' : ActorMethod<[UserProfile], Result_1>,
  'uploadFile' : ActorMethod<[UploadFileRequest], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
