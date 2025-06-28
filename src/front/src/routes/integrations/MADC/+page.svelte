<script>
	import { goto } from "$app/navigation";

</script>


<style>
  .center-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    min-height: 80vh;
  }
</style>

<div class="center-container">
  <button color="primary" on:click={() => goto('/integrations/MADC/G13')}>G13</button>
  <button color="primary" on:click={() => goto('/integrations/MADC/G14')}>G14</button>
  <button color="primary" on:click={() => goto('/integrations/MADC/G20')}>G20</button>
</div>