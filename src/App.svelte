<script>
  import Tailwind from "./Tailwind.svelte";

  export let name;
</script>

<Tailwind />

<main class="max-w-sm mx-auto p-4 text-center">
  <h1 class="text-6xl text-red-500 font-hairline uppercase">Hello {name}!</h1>
  <p class="mt-4">
    Visit the
    <a
      class="text-blue-500 hover:underline"
      href="https://svelte.dev/tutorial">Svelte tutorial</a>
    to learn how to build Svelte apps.
  </p>
</main>
