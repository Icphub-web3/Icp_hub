import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import {
  idlFactory,
  canisterId,
  createActor,
} from '../../declarations/icp_hub_backend/index.js';
import type { _SERVICE } from '../types/backend';

// Create actor instance - will be initialized when needed
let icpHubActor: _SERVICE | null = null;

// Initialize actor with proper canister ID
function initializeActor() {
  if (!icpHubActor && canisterId) {
    icpHubActor = createActor(canisterId);
  }
  return icpHubActor;
}

// Export the actor getter
export const getIcpHubActor = () => {
  return initializeActor();
};

// Example usage functions
export class ICPHubService {
  private actor: _SERVICE | null = null;

  constructor() {
    // Initialize actor when service is created
    this.actor = initializeActor();
  }

  private getActor(): _SERVICE {
    if (!this.actor) {
      throw new Error(
        'Backend actor not initialized. Make sure canister is deployed.'
      );
    }
    return this.actor;
  }

  // User management
  async registerUser(username: string, email?: string, profile = {}) {
    return await this.actor.registerUser({
      username,
      email: email ? [email] : [],
      profile: {
        displayName: [],
        bio: [],
        avatar: [],
        location: [],
        website: [],
        socialLinks: [],
        externalLinks: [],
        skills: [],
        ...profile,
      },
    });
  }

  async getUser(principal: any) {
    return await this.actor.getUser(principal);
  }

  async updateProfile(profile: any) {
    return await this.actor.updateProfile(profile);
  }

  // Repository management
  async createRepository(
    name: string,
    description?: string,
    isPrivate = false
  ) {
    return await this.actor.createRepository({
      name,
      description: description ? [description] : [],
      isPrivate,
      license: [],
    });
  }

  async getRepository(id: string) {
    return await this.actor.getRepository(id);
  }

  async listUserRepositories(username?: string, page = 0, limit = 10) {
    return await this.actor.listUserRepositories(username ? [username] : [], [
      {
        page: BigInt(page),
        limit: BigInt(limit),
      },
    ]);
  }

  async starRepository(repositoryId: string) {
    return await this.actor.starRepository(repositoryId);
  }

  async unstarRepository(repositoryId: string) {
    return await this.actor.unstarRepository(repositoryId);
  }

  async forkRepository(repositoryId: string, newName?: string) {
    return await this.actor.forkRepository(
      repositoryId,
      newName ? [newName] : []
    );
  }

  // File management
  async uploadFile(
    repositoryId: string,
    path: string,
    content: Uint8Array,
    commitMessage: string
  ) {
    return await this.actor.uploadFile({
      repositoryId,
      path,
      content,
      commitMessage,
    });
  }

  async getFile(repositoryId: string, path: string) {
    return await this.actor.getFile(repositoryId, path);
  }

  async listFiles(repositoryId: string, path?: string) {
    return await this.actor.listFiles(repositoryId, path ? [path] : []);
  }

  // Collaboration
  async addCollaborator(repositoryId: string, collaborator: any) {
    return await this.actor.addCollaborator(repositoryId, collaborator);
  }

  async getCollaborators(repositoryId: string) {
    return await this.actor.getCollaborators(repositoryId);
  }

  // Account linking
  async linkExternalAccount(platform: string, accountId: string) {
    return await this.actor.linkExternalAccount(platform, accountId);
  }

  async getLinkedAccounts() {
    return await this.actor.getLinkedAccounts();
  }

  // System
  async health() {
    return await this.actor.health();
  }

  async getMemoryStats() {
    return await this.actor.getMemoryStats();
  }
}

// Create service instance
export const icpHubService = new ICPHubService(icpHubActor);
