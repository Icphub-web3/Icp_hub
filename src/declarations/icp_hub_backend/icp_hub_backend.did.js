export const idlFactory = ({ IDL }) => {
  const Error = IDL.Variant({
    'NotFound' : IDL.Text,
    'Unauthorized' : IDL.Text,
    'InternalError' : IDL.Text,
    'Forbidden' : IDL.Text,
    'BadRequest' : IDL.Text,
    'Conflict' : IDL.Text,
  });
  const Result_2 = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : Error });
  const CreateRepositoryRequest = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Opt(IDL.Text),
    'isPrivate' : IDL.Bool,
    'license' : IDL.Opt(IDL.Text),
  });
  const FileEntry = IDL.Record({
    'commitMessage' : IDL.Opt(IDL.Text),
    'content' : IDL.Vec(IDL.Nat8),
    'hash' : IDL.Text,
    'path' : IDL.Text,
    'size' : IDL.Nat,
    'author' : IDL.Principal,
    'lastModified' : IDL.Int,
    'version' : IDL.Nat,
  });
  const SerializableRepository = IDL.Record({
    'id' : IDL.Text,
    'files' : IDL.Vec(IDL.Tuple(IDL.Text, FileEntry)),
    'forks' : IDL.Nat,
    'owner' : IDL.Principal,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'size' : IDL.Nat,
    'description' : IDL.Opt(IDL.Text),
    'language' : IDL.Opt(IDL.Text),
    'updatedAt' : IDL.Int,
    'stars' : IDL.Nat,
    'isPrivate' : IDL.Bool,
  });
  const Result_5 = IDL.Variant({
    'Ok' : SerializableRepository,
    'Err' : Error,
  });
  const Result_7 = IDL.Variant({
    'Ok' : IDL.Vec(IDL.Principal),
    'Err' : Error,
  });
  const Result = IDL.Variant({ 'Ok' : FileEntry, 'Err' : Error });
  const Result_6 = IDL.Variant({
    'Ok' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'Err' : Error,
  });
  const MemoryStats = IDL.Record({
    'heapSize' : IDL.Nat,
    'availableMemory' : IDL.Nat,
    'cycles' : IDL.Nat,
    'usedMemory' : IDL.Nat,
    'totalMemory' : IDL.Nat,
  });
  const UserProfile = IDL.Record({
    'bio' : IDL.Opt(IDL.Text),
    'externalLinks' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'displayName' : IDL.Opt(IDL.Text),
    'socialLinks' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'website' : IDL.Opt(IDL.Text),
    'skills' : IDL.Vec(IDL.Text),
    'location' : IDL.Opt(IDL.Text),
    'avatar' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const User = IDL.Record({
    'repositories' : IDL.Vec(IDL.Text),
    'principal' : IDL.Principal,
    'username' : IDL.Text,
    'createdAt' : IDL.Int,
    'email' : IDL.Opt(IDL.Text),
    'updatedAt' : IDL.Int,
    'profile' : UserProfile,
  });
  const Result_1 = IDL.Variant({ 'Ok' : User, 'Err' : Error });
  const FileListResponse = IDL.Record({
    'files' : IDL.Vec(FileEntry),
    'path' : IDL.Text,
    'totalCount' : IDL.Nat,
  });
  const Result_4 = IDL.Variant({ 'Ok' : FileListResponse, 'Err' : Error });
  const PaginationParams = IDL.Record({ 'page' : IDL.Nat, 'limit' : IDL.Nat });
  const RepositoryListResponse = IDL.Record({
    'repositories' : IDL.Vec(SerializableRepository),
    'hasMore' : IDL.Bool,
    'totalCount' : IDL.Nat,
  });
  const Result_3 = IDL.Variant({
    'Ok' : RepositoryListResponse,
    'Err' : Error,
  });
  const RegisterUserRequest = IDL.Record({
    'username' : IDL.Text,
    'email' : IDL.Opt(IDL.Text),
    'profile' : UserProfile,
  });
  const UploadFileRequest = IDL.Record({
    'repositoryId' : IDL.Text,
    'commitMessage' : IDL.Text,
    'content' : IDL.Vec(IDL.Nat8),
    'path' : IDL.Text,
  });
  return IDL.Service({
    'addCollaborator' : IDL.Func([IDL.Text, IDL.Principal], [Result_2], []),
    'createRepository' : IDL.Func([CreateRepositoryRequest], [Result_5], []),
    'forkRepository' : IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [Result_5], []),
    'getCollaborators' : IDL.Func([IDL.Text], [Result_7], ['query']),
    'getFile' : IDL.Func([IDL.Text, IDL.Text], [Result], ['query']),
    'getLinkedAccounts' : IDL.Func([], [Result_6], ['query']),
    'getMemoryStats' : IDL.Func([], [MemoryStats], ['query']),
    'getRepository' : IDL.Func([IDL.Text], [Result_5], ['query']),
    'getUser' : IDL.Func([IDL.Principal], [Result_1], ['query']),
    'health' : IDL.Func([], [IDL.Bool], ['query']),
    'linkExternalAccount' : IDL.Func([IDL.Text, IDL.Text], [Result_2], []),
    'listFiles' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Text)],
        [Result_4],
        ['query'],
      ),
    'listUserRepositories' : IDL.Func(
        [IDL.Opt(IDL.Text), IDL.Opt(PaginationParams)],
        [Result_3],
        ['query'],
      ),
    'registerUser' : IDL.Func([RegisterUserRequest], [Result_1], []),
    'starRepository' : IDL.Func([IDL.Text], [Result_2], []),
    'unstarRepository' : IDL.Func([IDL.Text], [Result_2], []),
    'updateProfile' : IDL.Func([UserProfile], [Result_1], []),
    'uploadFile' : IDL.Func([UploadFileRequest], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
