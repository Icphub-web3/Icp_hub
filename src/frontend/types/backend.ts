import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface UserProfile {
  avatar: [] | [Uint8Array];
  bio: [] | [string];
  displayName: [] | [string];
  externalLinks: Array<[string, string]>;
  location: [] | [string];
  skills: Array<string>;
  socialLinks: Array<[string, string]>;
  website: [] | [string];
}

export interface User {
  createdAt: bigint;
  email: [] | [string];
  principal: Principal;
  profile: UserProfile;
  repositories: Array<string>;
  updatedAt: bigint;
  username: string;
}

export interface UploadFileRequest {
  commitMessage: string;
  content: Uint8Array;
  path: string;
  repositoryId: string;
}

export interface SerializableRepository {
  createdAt: bigint;
  description: [] | [string];
  files: Array<[string, FileEntry]>;
  forks: bigint;
  id: string;
  isPrivate: boolean;
  language: [] | [string];
  name: string;
  owner: Principal;
  size: bigint;
  stars: bigint;
  updatedAt: bigint;
}

export interface RepositoryListResponse {
  hasMore: boolean;
  repositories: Array<SerializableRepository>;
  totalCount: bigint;
}

export interface RegisterUserRequest {
  email: [] | [string];
  profile: UserProfile;
  username: string;
}

export interface PaginationParams {
  limit: bigint;
  page: bigint;
}

export interface MemoryStats {
  availableMemory: bigint;
  cycles: bigint;
  heapSize: bigint;
  totalMemory: bigint;
  usedMemory: bigint;
}

export interface FileListResponse {
  files: Array<FileEntry>;
  path: string;
  totalCount: bigint;
}

export interface FileEntry {
  author: Principal;
  commitMessage: [] | [string];
  content: Uint8Array;
  hash: string;
  lastModified: bigint;
  path: string;
  size: bigint;
  version: bigint;
}

export type Error =
  | { BadRequest: string }
  | { Conflict: string }
  | { Forbidden: string }
  | { InternalError: string }
  | { NotFound: string }
  | { Unauthorized: string };

export interface CreateRepositoryRequest {
  description: [] | [string];
  isPrivate: boolean;
  license: [] | [string];
  name: string;
}

export type Result_7 = { Err: Error } | { Ok: Array<Principal> };
export type Result_6 = { Err: Error } | { Ok: Array<[string, string]> };
export type Result_5 = { Err: Error } | { Ok: SerializableRepository };
export type Result_4 = { Err: Error } | { Ok: FileListResponse };
export type Result_3 = { Err: Error } | { Ok: RepositoryListResponse };
export type Result_2 = { Err: Error } | { Ok: string };
export type Result_1 = { Err: Error } | { Ok: User };
export type Result = { Err: Error } | { Ok: FileEntry };

export interface _SERVICE {
  addCollaborator: ActorMethod<[string, Principal], Result_2>;
  createRepository: ActorMethod<[CreateRepositoryRequest], Result_5>;
  forkRepository: ActorMethod<[string, [] | [string]], Result_5>;
  getCollaborators: ActorMethod<[string], Result_7>;
  getFile: ActorMethod<[string, string], Result>;
  getLinkedAccounts: ActorMethod<[], Result_6>;
  getMemoryStats: ActorMethod<[], MemoryStats>;
  getRepository: ActorMethod<[string], Result_5>;
  getUser: ActorMethod<[Principal], Result_1>;
  health: ActorMethod<[], boolean>;
  linkExternalAccount: ActorMethod<[string, string], Result_2>;
  listFiles: ActorMethod<[string, [] | [string]], Result_4>;
  listUserRepositories: ActorMethod<
    [[] | [string], [] | [PaginationParams]],
    Result_3
  >;
  registerUser: ActorMethod<[RegisterUserRequest], Result_1>;
  starRepository: ActorMethod<[string], Result_2>;
  unstarRepository: ActorMethod<[string], Result_2>;
  updateProfile: ActorMethod<[UserProfile], Result_1>;
  uploadFile: ActorMethod<[UploadFileRequest], Result>;
}
