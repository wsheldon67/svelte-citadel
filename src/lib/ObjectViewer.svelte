<script lang="ts">
  import ObjectViewer from './ObjectViewer.svelte'
  const { object, name = 'Object' } = $props()

  function isObject(val: any) {
    return val && typeof val === 'object' && !Array.isArray(val);
  }
</script>

{#if isObject(object)}
  <details>
    <summary>{name}</summary>
    <ul style="list-style: none; padding-left: 1em;">
      {#each Object.entries(object) as [key, value]}
        <li>
          {#if isObject(value) || Array.isArray(value)}
            <ObjectViewer object={value} name={key} />
          {:else}
            <strong>{key}:</strong>
            <span>{JSON.stringify(value)}</span>
          {/if}
        </li>
      {/each}
    </ul>
  </details>
{:else if Array.isArray(object)}
  <details>
    <summary>{name}[{object.length}]</summary>
    <ul style="list-style: none; padding-left: 1em;">
      {#each object as item, i}
        <li>
          {#if isObject(item) || Array.isArray(item)}
            <ObjectViewer object={item} name={String(i)} />
          {:else}
            <strong>{i}:</strong>
            <span>{JSON.stringify(item)}</span>
          {/if}
        </li>
      {/each}
    </ul>
  </details>
{:else}
  <span>{JSON.stringify(object)}</span>
{/if}