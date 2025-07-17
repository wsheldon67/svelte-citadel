<script lang="ts">
  import { generate_name } from "$lib/name_generator";

  let name = $state(generate_name());
</script>
<p>{name}</p>
<button
  onclick={() => name = generate_name()}
>Generate New Name</button>