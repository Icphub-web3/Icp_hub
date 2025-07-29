# ICP Hub Backend API

This document describes how to use the ICP Hub backend service interface (.did file) in your frontend application.

## Files Generated

1. **`icp_hub_backend.did`** - Candid interface definition file
2. **`src/frontend/types/backend.ts`** - TypeScript type definitions
3. **`src/frontend/utils/icpHub.ts`** - Service wrapper with example usage

## Service Interface

The backend provides the following main functionalities:

### User Management
- `registerUser` - Register a new user
- `getUser` - Get user information
- `updateProfile` - Update user profile

### Repository Management
- `createRepository` - Create a new repository
- `getRepository` - Get repository details
- `listUserRepositories` - List user's repositories with pagination
- `starRepository` / `unstarRepository` - Star/unstar repositories
- `forkRepository` - Fork an existing repository

### File Management
- `uploadFile` - Upload files to repository
- `getFile` - Get file content
- `listFiles` - List files in repository

### Collaboration
- `addCollaborator` - Add collaborators to repository
- `getCollaborators` - Get repository collaborators

### Account Linking
- `linkExternalAccount` - Link external accounts (GitHub, etc.)
- `getLinkedAccounts` - Get linked accounts

### System
- `health` - Health check
- `getMemoryStats` - Get memory statistics

## Usage Examples

### Basic Setup

```typescript
import { createActor } from '@dfinity/agent';
import { canisterId, idlFactory } from '../declarations/icp_hub_backend';
import type { _SERVICE } from './types/backend';

const actor = createActor<_SERVICE>(idlFactory, { canisterId });
```

### Register User

```typescript
const result = await actor.registerUser({
  username: "alice",
  email: ["alice@example.com"],
  profile: {
    displayName: ["Alice"],
    bio: ["Developer"],
    avatar: [],
    location: ["New York"],
    website: ["https://alice.dev"],
    socialLinks: [["twitter", "@alice"]],
    externalLinks: [["github", "alice"]],
    skills: ["Motoko", "TypeScript"]
  }
});
```

### Create Repository

```typescript
const result = await actor.createRepository({
  name: "my-project",
  description: ["A cool project"],
  isPrivate: false,
  license: ["MIT"]
});
```

### Upload File

```typescript
const fileContent = new TextEncoder().encode("Hello, World!");
const result = await actor.uploadFile({
  repositoryId: "repo_1",
  path: "README.md",
  content: fileContent,
  commitMessage: "Initial commit"
});
```

### List Repositories

```typescript
const result = await actor.listUserRepositories(
  [], // current user
  [{ page: BigInt(0), limit: BigInt(10) }]
);
```

## Error Handling

All service methods return a `Result` type that can be either `Ok` or `Err`:

```typescript
const result = await actor.getRepository("repo_1");

if ('Ok' in result) {
  const repository = result.Ok;
  console.log('Repository:', repository);
} else {
  const error = result.Err;
  console.error('Error:', error);
}
```

## Type Definitions

The TypeScript types handle ICP's optional values and bigint numbers correctly:

- Optional values: `[] | [T]` (empty array or single-element array)
- Numbers: `bigint` for Nat/Int types
- Binary data: `Uint8Array` for blob types
- Principals: `Principal` type from `@dfinity/principal`

## Development

To regenerate the interface files after changing the backend:

1. Update your Motoko code in `src/backend/main.mo`
2. Run `dfx build icp_hub_backend`
3. The `.did` file will be automatically updated in `.dfx/local/canisters/icp_hub_backend/`
4. Copy the updated interface to your project root if needed

## Authentication

Most methods require authentication. Make sure your frontend is properly connected to Internet Identity or another authentication provider before calling these methods.

## Deployment

When deploying to mainnet, update the canister ID in your frontend configuration to point to your deployed backend canister.
