<template>
  <v-container fluid class="pa-0">
    <div class="text-center">
      <header class="header">
        <h1>Customer Support Page</h1>
      </header>
      <v-btn x-large color="success" dark :to="{ name: 'signup' }">sign up</v-btn>
      <v-btn x-large color="success" dark :to="{ name: 'login' }">log in</v-btn>
      <v-btn x-large color="success" dark :to="{ name: 'guest' }">use guest account</v-btn>
    </div>
  </v-container>
</template>

<script>
import rainbowSDK from "rainbow-web-sdk";
// eslint-disable-next-line no-unused-vars
// import axios from "axios";

export default {
  name: "Home",
  // components: {},
  // data() {
  //   return {
  //     version: rainbowSDK.version()
  //   };
  // },

  created() {
    document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, this.onLoaded);
    rainbowSDK.start();
    rainbowSDK.load();
  },
  methods: {
    onLoaded: function() {
      //set app id
      var applicationID = "";
      //set app secret
      var applicationSecret = "";
      rainbowSDK.setVerboseLog(false);
      rainbowSDK
        .initialize(applicationID, applicationSecret)
        .then(() => {
          console.log("[DEMO] :: Rainbow SDK is initialized!");
        })
        .catch(err => {
          console.log("[DEMO] :: Something went wrong with the SDK...", err);
        });
      console.log("onLoaded()");
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.header {
  background: #50cca3;
  color: #fff;
  text-align: center;
  padding: 150px;
}

.header a {
  color: #fff;
  padding-right: 5px;
  text-decoration: none;
}
</style>
