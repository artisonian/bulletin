<script>
  import { session, error, pending } from "./stores";

  import Tailwind from "./Tailwind.svelte";

  let init = window.userbase
    .init({ appId: "5bfb2166-925d-449c-b7a2-ca5ee9b02f8b" })
    .then((newSession) => {
      session.set(newSession);
    });
  pending.enqueue(init);

  let username = "";
  let password = "";
  let rememberMe = true;

  function resetForm() {
    username = "";
    password = "";
    rememberMe = true;
  }

  $: sessionType = rememberMe ? "local" : "none";

  async function handleLogin() {
    $error = null;
    try {
      const user = await window.userbase.signIn({
        username,
        password,
        rememberMe: sessionType,
      });
      $session = { user };
      resetForm();
    } catch (e) {
      $error = e;
    }
  }

  async function handleSignup() {
    $error = null;
    try {
      const user = await window.userbase.signUp({
        username,
        password,
        rememberMe: sessionType,
      });
      $session = { user };
      resetForm();
    } catch (e) {
      $error = e;
    }
  }

  async function handleLogout() {
    $error = null;
    try {
      await window.userbase.signOut();
      $session = {};
    } catch (e) {
      $error = e;
    }
  }
</script>

<Tailwind />

{#if $pending}
  <hr class="w-full min-h-screen border-t-4 border-purple-500" />
{/if}

{#if $error}
  <div
    class="max-w-sm mx-auto mt-4 p-4 border-l-4 border-red-800 bg-red-200 text-red-800">
    {$error.message}
  </div>
{/if}

<main class="max-w-sm mx-auto p-4">
  {#if $session.user}
    <h1 class="text-6xl text-red-500 font-hairline uppercase">
      Hello
      {$session.user.username}!
    </h1>
    <button
      class="shadow bg-gray-500 hover:bg-gray-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
      type="button"
      on:click={() => pending.enqueue(handleLogout())}>Log out</button>
  {:else}
    <form class="w-full max-w-sm">
      <div class="md:flex md:items-center mb-6">
        <div class="md:w-1/3">
          <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-username">
            Username
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-white appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
            id="inline-username"
            type="text"
            placeholder="JaneDoe123"
            bind:value={username} />
        </div>
      </div>
      <div class="md:flex md:items-center mb-6">
        <div class="md:w-1/3">
          <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-password">
            Password
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-white appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
            id="inline-password"
            type="password"
            placeholder="******************"
            bind:value={password} />
        </div>
      </div>
      <div class="md:flex md:items-center mb-6">
        <div class="md:w-1/3" />
        <label class="md:w-2/3 block text-gray-500 font-bold">
          <input
            class="mr-2 leading-tight"
            type="checkbox"
            bind:checked={rememberMe} />
          <span class="text-sm"> Remember me</span>
        </label>
      </div>
      <div class="md:flex md:items-center">
        <div class="md:w-1/3" />
        <div class="md:w-2/3">
          <button
            class="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
            type="button"
            on:click={() => pending.enqueue(handleLogin())}>
            Log In
          </button>
          <span class="mx-4">or</span>
          <button
            class="shadow bg-gray-500 hover:bg-gray-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
            type="button"
            on:click={() => pending.enqueue(handleSignup())}>
            Sign Up
          </button>
        </div>
      </div>
    </form>
  {/if}
</main>
