const OKTA_GUEST_TYPE = process.env.OKTA_GUEST_TYPE;
const OKTA_GUEST_GROUP = process.env.OKTA_GUEST_GROUP;
const OKTA_TOKEN = process.env.OKTA_TOKEN;
const OKTA_URL = process.env.OKTA_URL;
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const _ = require("lodash");

function _showError(error) {
  let errorResponse = {
    status: 500,
    message: JSON.stringify(error),
  };
  if (_.get(error, "response.data")) {
    errorResponse = {
      status: error.response.status,
      message: error.response.data,
    };
  }

  return errorResponse;
}

class Okta {
  constructor() {}
  generatePass() {
    return `GuEST_${Math.random().toString(36).slice(2)}!Nand@@os`;
  }
  async createGuestOption2(email) {
    try {
      const tmpPass = this.generatePass();
      let guest = {
        session: null,
        existingGuest: false,
        existingRegisteredUser: false,
        email: null,
        passwordChanged: false,
        removeFromGuestGroup: null,
      };
      let user;
      const emailGuest = `${email}.guest`;

      // TODO: Profile API V2 Check here
      const profileId = uuidv4();

      // Check If GUEST exists
      const existingGuest = await this.findUser(emailGuest);
      if (existingGuest) {
        // Setting random password
        user = await this.updateUser(existingGuest.id, tmpPass, {
          profile_id: profileId,
        });
        guest.existingGuest = true;
      } else {
        // Create user on GUEST group with a tmp password
        user = await this.createUser(
          {
            email: `${email}`,
            login: `${emailGuest}`,
            profile_id: profileId,
            customer_type: "guest",
          },
          tmpPass
        );
      }

      // Check If an already registered user exists
      if (await this.findUser(email)) {
        guest.existingRegisteredUser = true;
      }
      // Perform AuthN with the user on the guest group (NO MFA)
      const { sessionToken, expiresAt } = await this.authN(emailGuest, tmpPass);

      return {
        ...guest,
        session: sessionToken,
        sessionExpires: expiresAt,
        email: email,
        login: emailGuest,
        passwordChanged: user.passwordChanged,
      };
    } catch (error) {
      console.error(error);
      throw _showError(error);
    }
  }

  async removeUserFromGroup(id, groupId) {
    try {
      const res = await axios({
        method: "DELETE",
        url: `${OKTA_URL}/api/v1/groups/${groupId}/users/${id}`,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `SSWS ${OKTA_TOKEN}`,
        },
      });

      return res.status === 204;
    } catch (error) {
      throw _showError(error);
    }
  }

  async addUserToGroup(id, groupId) {
    try {
      const res = await axios({
        method: "PUT",
        url: `${OKTA_URL}/api/v1/groups/${groupId}/users/${id}`,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `SSWS ${OKTA_TOKEN}`,
        },
      });

      return res.status === 204;
    } catch (error) {
      throw _showError(error);
    }
  }

  async updateUser(id, tmpPass, profile) {
    try {
      const res = await axios({
        method: "post",
        url: `${OKTA_URL}/api/v1/users/${id}`,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `SSWS ${OKTA_TOKEN}`,
        },
        data: JSON.stringify({
          credentials: {
            password: {
              value: `${tmpPass}`,
            },
          },
          profile: profile,
        }),
      });
      if (_.get(res, "data.id")) {
        return res.data;
      } else {
        return false;
      }
    } catch (error) {
      throw _showError(error);
    }
  }

  async authN(email, password) {
    try {
      const res = await axios({
        method: "post",
        url: `${OKTA_URL}/api/v1/authn`,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `SSWS ${OKTA_TOKEN}`,
        },
        data: JSON.stringify({
          username: `${email}`,
          password: `${password}`,
        }),
      });

      if (_.get(res, "data.sessionToken") && res.data.status === "SUCCESS") {
        return res.data;
      } else {
        return false;
      }
    } catch (error) {
      throw _showError(error);
    }
  }

  async findUser(email) {
    try {
      const res = await axios({
        method: "get",
        url: `${OKTA_URL}/api/v1/users/${encodeURIComponent(email)}`,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `SSWS ${OKTA_TOKEN}`,
        },
      });

      if (_.get(res, "data.id")) {
        return res.data;
      } else {
        return false;
      }
    } catch (error) {
      // throw _showError(error);
      return false;
    }
  }
  async createUser(profile, tmpPass) {
    try {
      const data = JSON.stringify({
        profile: profile,
        type: {
          id: OKTA_GUEST_TYPE,
        },
        groupIds: [OKTA_GUEST_GROUP],
        credentials: {
          password: {
            value: `${tmpPass}`,
          },
        },
      });

      const config = {
        method: "post",
        url: `${OKTA_URL}/api/v1/users?activate=true`,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `SSWS ${OKTA_TOKEN}`,
        },
        data: data,
      };

      const res = await axios(config);
      if (_.get(res, "data")) {
        return res.data;
      } else {
        return false;
      }
    } catch (error) {
      throw _showError(error);
    }
  }
}
module.exports = Okta;
