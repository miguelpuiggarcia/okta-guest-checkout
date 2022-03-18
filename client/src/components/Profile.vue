<template>
  <div class="profile">
    <h1 class="ui header">
      <span class="badge badge-secondary" v-if="isGuest">GUEST</span>
      <span class="badge badge-primary" v-if="!isGuest">REGISTERED</span> My
      User Profile
    </h1>

    <hr class="mb-10" />

    <p class="mb-5" v-if="isGuest">
      Want to enjoy all Nando's features?

      <label for="promote-modal" class="modal-button text-emerald-700"
        >Click here to create an account</label
      >
    </p>

    <div class="tabs tabs-boxed">
      <a
        :class="`tab ${tab == 'tab1' ? 'tab-active' : ''}`"
        @click="changeTab('tab1')"
        >ID Token</a
      >
      <a
        :class="`tab ${tab == 'tab2' ? 'tab-active' : ''}`"
        @click="changeTab('tab2')"
        >Access Token</a
      >
      <a
        :class="`tab ${tab == 'tab3' ? 'tab-active' : ''}`"
        @click="changeTab('tab3')"
        >Claims</a
      >
    </div>

    <div class="tabContent mt-5" v-if="tab === 'tab1'">
      <div class="text-sm whitespace-nowrap overflow-x-auto">
        <pre>{{ idToken }}</pre>
      </div>
    </div>

    <div class="tabContent mt-5" v-if="tab === 'tab2'">
      <div class="text-sm whitespace-nowrap overflow-x-auto">
        <pre>{{ accessToken }}</pre>
      </div>
    </div>

    <div class="tabContent mt-5" v-if="tab === 'tab3'">
      <div class="text-sm whitespace-nowrap overflow-x-auto">
        <table class="ui table">
          <thead>
            <tr>
              <th>Claim</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(claim, index) in claims" :key="index">
              <td>{{ claim.claim }}</td>
              <td :id="'claim-' + claim.claim">{{ claim.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <input type="checkbox" id="promote-modal" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box relative">
        <label
          for="promote-modal"
          class="btn btn-sm btn-circle absolute right-2 top-2"
          >✕</label
        >
        <h3>Choose a password!</h3>
        <div class="mb-5">
          <input
            class="mt-3 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            v-model="password"
            type="password"
            placeholder="password"
          />
        </div>
        <div class="mb-5">
          <input
            class="mb-5shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="repeatPassword"
            v-model="repeatPassword"
            type="password"
            placeholder="Repeat password"
          />
        </div>
        <div class="mt-3">
          <p class="text-red-500" v-if="password !== repeatPassword">
            Passwords are not the same
          </p>
        </div>
        <div class="text-center mt-3">
          <span
            :class="`btn btn-secondary ${
              guestLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`"
            role="button"
            v-on:click="promoteAccount()"
          >
            Create Account
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Profile",
  data() {
    return {
      claims: [],
      accessToken: null,
      idToken: null,
      tab: "tab1",
      isGuest: null,
      password: null,
      repeatPassword: null,
      guestLoading: false,
    };
  },
  methods: {
    changeTab(tab) {
      this.tab = tab;
    },
    promoteAccount() {
      this.guestLoading = true;
      setTimeout(() => {
        this.guestLoading = false;
        alert(
          "Account created, redirecting you back to this screen in a few secs... We just created a real account (or update an existing one with the new password) and perform authN..."
        );
      }, 3000);
    },
  },
  computed: {},
  async created() {
    const idToken = await this.$auth.tokenManager.get("idToken");
    const accessToken = await this.$auth.tokenManager.get("accessToken");
    this.idToken = idToken;
    this.accessToken = accessToken;

    this.claims = await Object.entries(idToken.claims).map((entry) => ({
      claim: entry[0],
      value: entry[1],
    }));
    // Check if guest
    let guestVal = this.claims.find(function (item) {
      return item.claim === "customer_type";
    });
    this.isGuest = guestVal.value === "guest" ? true : false;
  },
};
</script>
