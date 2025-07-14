<script lang="ts">
  import { Tile } from "./tile.svelte";
  import { Layer } from "./entity.svelte";
  import { iter_enum_values } from "./util";
  import EntityUi from "./EntityUI.svelte";
  
  const {
    tile,
    on_click = () => {},
  }: {
    tile: Tile,
    on_click?: () => void,
  } = $props()

</script>
<button class='tile' onclick={on_click}>
  {#each iter_enum_values(Layer) as layer}
    {#if tile.has_entity_at_layer(layer)}
      <EntityUi entity={tile.get_entity_at_layer(layer)!} />
    {/if}
  {/each}
  <div class='coordinate_label'>{tile.coordinate_data}</div>
</button>

<style>
  .tile {
    position: relative;
    width: 3rem;
    height: 3rem;
    border: none;
    background-color: transparent;
  }
  .tile > :global(button) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .coordinate_label {
    color: white;
    position: absolute;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 0.1rem;
  }
</style>