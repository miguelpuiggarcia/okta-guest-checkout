<template>
  <div id="app">
    <div class="navbar bg-base-100">
      <div class="navbar-start">
        <a class="btn btn-ghost normal-case text-xl">
          <img src="./assets/barci.svg" class="w-32"
        /></a>
      </div>
      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal p-0">
          <li v-if="authState?.isAuthenticated">
            <router-link to="/profile" class="item" id="profile-button">
              Profile
            </router-link>
          </li>
        </ul>
      </div>
      <div class="navbar-end">
        <a class="btn" v-if="authState?.isAuthenticated" v-on:click="logout()"
          >Logout {{ claims }}</a
        >

        <a class="btn" v-if="!authState?.isAuthenticated" v-on:click="login()"
          >Login</a
        >
      </div>
    </div>

    <div class="ui text container" style="margin-top: 7em">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: "app",
  data: function () {
    return {
      claims: "",
    };
  },
  mounted() {
    this.setup();
  },
  methods: {
    async setup() {
      console.log("as ", this.authState);
      if (this.authState?.isAuthenticated) {
        this.claims = await this.$auth.getUser();
      }
    },
    login() {
      this.$auth.signInWithRedirect({ originalUri: "/" });
    },
    async logout() {
      await this.$auth.signOut();
    },
  },
};
</script>
