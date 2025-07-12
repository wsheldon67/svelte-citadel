<script lang='ts'>
  import { storage } from './firebase';
  import { Entity } from '$lib/entity.svelte';
  import { ref, getDownloadURL } from 'firebase/storage';

  const { entity }: { entity: Entity } = $props();

  async function get_image():Promise<string> {
    const image_ref = ref(storage, `builtin/default/${entity.img_path}`)
    const url = await getDownloadURL(image_ref)
    return url
  }
</script>
{#await get_image() then url }
  <img src={url} alt={entity.data.kind} class="entity-image" />
{:catch error}
  <p>Error loading image: {error.message}</p>
{/await}

<style>
  img {
    width: 3rem;
    height: 3rem;
  }
</style>