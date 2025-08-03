<script lang="ts">
  import type { Entity } from "./entity"
  import { EntityList } from "./entity_list"
  import EntityUi from "./EntityUI.svelte"

  const {
    entity_types,
    on_select = (entity_type) => {}
  }: {
    entity_types: {[entity_name: string]: typeof Entity}
    on_select?: (entity_kind: string, entity_type: typeof Entity) => void
  } = $props()

  const entity_list = new EntityList({name: 'Entity Selector', entities: []}, entity_types)
  
</script>
{#each Object.entries(entity_types) as [kind, EntityType]}
  <EntityUi entity={new EntityType({kind, created_by: '', id: kind, owner: ''}, entity_list)} on_click={() => on_select(kind, EntityType)} />
{/each}