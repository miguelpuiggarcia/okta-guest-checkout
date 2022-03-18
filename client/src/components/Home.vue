<template>
  <div id="home">
    <div
      class="card lg:card-side bg-base-100 shadow-xl"
      v-if="!authState?.isAuthenticated"
    >
      <figure>
        <img
          src="https://www.nandos.co.uk/sites/default/files/M_CHIX_RangeCore2021%20%281%29_1.jpg"
          alt="Peri lovers"
          class="w-96"
        />
      </figure>
      <div class="card-body">
        <h2 class="card-title">Olá!</h2>
        <p>Click here to enjoy our Peri Peri heaven.</p>
        <div class="card-actions justify-end">
          <button
            id="login-button"
            class="btn btn-primary"
            role="button"
            v-on:click="login()"
          >
            Customer Login
          </button>
          <label for="guest-modal" class="btn modal-button btn btn-secondary"
            >Guest access</label
          >
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl" v-if="authState?.isAuthenticated">
      <div class="card-body">
        <h2 class="card-title">Olá, {{ claims && claims.name }}!</h2>

        <div class="card-actions justify-end">
          <p class="mb-10">
            You have successfully authenticated against your Okta org, and have
            been redirected back to this application. You now have an ID token
            and access token in local storage.
          </p>

          <a class="btn btn-link" href="/profile"> My profile </a>

          <button
            id="login-button"
            class="btn btn-link"
            role="button"
            v-on:click="logout()"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
    <input type="checkbox" id="guest-modal" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box relative">
        <label
          for="guest-modal"
          class="btn btn-sm btn-circle absolute right-2 top-2"
          >✕</label
        >

        <div v-if="guestData.guest.existingRegisteredUser">
          <h3 class="text-lg font-bold text-center">Welcome back!</h3>
          <div class="w-full py-4 text-center">
            <div class="mb-5 mt-3">
              <img
                src="https://media.giphy.com/media/3oxQNp0SiNeaYQ51Vm/giphy.gif"
                class="mb-5 w-48 text-center m-auto"
              />
              <strong>We noticed you have already an account with us.</strong>
              <br />
              <br />Why don't you log in as a customer to enjoy
              <a href="javascript:void(0);">all these perks</a>
            </div>

            <p class="mb-5">
              <button
                id="login-button"
                class="btn btn-primary"
                role="button"
                v-on:click="login()"
              >
                Login here
              </button>
            </p>

            <p>
              <a
                v-on:click="loginGuest(guestData.guest.session)"
                href="javascript:void(0);"
                >[Continue as guest]</a
              >
            </p>
          </div>
        </div>

        <div v-if="!guestData.guest.session">
          <h3 class="text-lg font-bold">We just need a bit from you...</h3>
          <div class="w-full py-4">
            <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div class="mb-4">
                <input
                  class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  v-model="guestEmail"
                  type="text"
                  placeholder="email"
                />
                <div class="mt-3 mb-6">
                  <label class="block text-gray-500 font-bold">
                    <input class="mr-2 leading-tight" type="checkbox" />
                    <span class="text-sm">
                      Sign me up to Nando’s emails for access to exclusive
                      events and Extra Hot competitions!
                    </span>
                  </label>
                </div>
                <div class="text-center mt-3">
                  <span
                    :class="`btn btn-secondary ${
                      guestLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`"
                    role="button"
                    v-on:click="access()"
                  >
                    Continue
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "home",
  data: function () {
    return {
      claims: "",
      guestEmail: "",
      guestLoading: false,
      guestData: {
        guest: {
          existingGuest: null,
          session: null,
        },
        authorizeUrl: null,
      },
    };
  },
  created() {
    this.setup();
  },
  methods: {
    async setup() {
      if (this.authState?.isAuthenticated) {
        this.claims = await this.$auth.getUser();
      }
    },
    async logout() {
      await this.$auth.signOut();
    },
    async access() {
      if (this.guestEmail === "") {
        alert("Please write an email");
        return;
      }
      this.guestLoading = true;
      try {
        const guestResponse = await axios({
          method: "post",
          url: `${process.env.API_URL}/api/guest/new`,
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify({
            email: this.guestEmail,
          }),
        });
        console.log("guestResponse: ", guestResponse.data);
        this.guestData = guestResponse.data;
        if (
          !this.guestData.guest.existingRegisteredUser &&
          this.guestData.guest.session
        ) {
          console.log("Redirecting you are not guest...");

          this.loginGuest(this.guestData.guest.session);
        }

        this.guestLoading = false;
      } catch (error) {
        console.error(error);
        alert(`There is an error ${JSON.stringify(error)}`);
        this.guestLoading = false;
      }
    },
    async login() {
      await this.$auth.revokeAccessToken();
      this.$auth.signInWithRedirect({ originalUri: "/" });
    },
    loginGuest(session) {
      this.$auth.signInWithRedirect({
        originalUri: "/",
        sessionToken: session,
      });
    },
  },
};
</script>
