<script lang='ts'>
  import { Entity } from '$lib/entity.svelte';
    import { get_img_url } from './util';

  const {
    entity,
    on_click = () => {},
    selected = false,
  }: {
    entity: Entity
    on_click?: () => void,
    selected?: boolean
  } = $props();

  async function get_image(entity: Entity):Promise<string> {
    const url = await get_img_url(`builtin/default/${entity.img_path}`)
    return url
  }
</script>
{#await get_image(entity) then url }
  <button
    style="background-image: url({url})"
    onclick={on_click}
    class:selected={selected}
    style:z-index={entity.layer}
  >{entity.data.kind}</button>
{:catch error}
  <button>Error loading image: {error.message}</button>
{/await}

<style>
  button {
    width: 3rem;
    height: 3rem;
    color: transparent;
    text-shadow: none;
    border: none;
    background-size: cover;
    background-position: center;
    background-color: transparent;
  }
  button.selected {
    border: 2px solid blue;
  }
</style>