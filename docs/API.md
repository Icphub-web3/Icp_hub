# Storage Canister API

## Methods

### setText

```candid
setText: (text: Text) -> ()
```

**Description:** Sets the stored text. Only the controller (canister owner) can call this method. Unauthorized callers receive an error.

### getText

```candid
getText: () -> (text: Text)
```

**Description:** Returns the currently stored text.

## Upgrade Safety

- State is persisted using Motoko's `stable var`.
- Upgrade hooks (`pre_upgrade`, `post_upgrade`) are implemented for safe upgrades.

## Error Handling

- `setText` throws `"Unauthorized"` error for non-controller callers.

## Example Usage

```bash
dfx canister call storage setText '("Hello ICP")'
dfx canister call storage getText
```

## Integration Notes

- For upgrade tests, use PocketIC's upgradeCanister API and verify persistence.
