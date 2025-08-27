import { Actor, HttpAgent } from "@dfinity/agent";
// Adjust the import path below to match your declarations output
import { idlFactory as repo_idl, canisterId as repo_id } from "../../declarations/repo";

const agent = new HttpAgent();
const repoActor = Actor.createActor(repo_idl, { agent, canisterId: repo_id });

export async function createRepo(name, owner) {
  return await repoActor.createRepo(name, owner);
}

export async function getRepo(id) {
  return await repoActor.getRepo(id);
}

export async function updateRepo(id, name) {
  return await repoActor.updateRepo(id, name);
}

export async function deleteRepo(id) {
  return await repoActor.deleteRepo(id);
}
