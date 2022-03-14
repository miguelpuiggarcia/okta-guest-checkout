<template>
  <div class="profile">
    <h1 class="ui header">
      <i aria-hidden="true" class="drivers license icon"> </i>
      My User Profile
    </h1>

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
    };
  },
  methods: {
    changeTab(tab) {
      this.tab = tab;
    },
  },

  async created() {
    const idToken = await this.$auth.tokenManager.get("idToken");
    const accessToken = await this.$auth.tokenManager.get("accessToken");
    this.idToken = idToken;
    this.accessToken = accessToken;

    this.claims = await Object.entries(idToken.claims).map((entry) => ({
      claim: entry[0],
      value: entry[1],
    }));
  },
};
</script>
