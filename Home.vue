<template>
  <v-container fluid class="pa-0">
    <div class="text-center">
      <header class="header">
        <h1>Customer Support Page</h1>
      </header>
      <v-btn
        width="550"
        left
        height="180"
        x-large
        color="#607D8B"
        dark
        :to="{ name: 'signup' }"
      >sign up</v-btn>
      <v-btn width="550" height="180" x-large color="#78909C" dark :to="{ name: 'login' }">log in</v-btn>
      <v-btn
        width="550"
        right
        height="180"
        x-large
        color="#B0BEC5"
        dark
        :to="{ name: 'guest' }"
      >use guest account</v-btn>
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
      var applicationID = "ecb354505ef711ea9a6dcf004cf8c14e";
      //set app secret
      var applicationSecret =
        "8qXAAAXSKPN2JirciZwpoTkkzqLX8AWx55kg55WRFSmVGrIfb2xEleTeuwp44qVB";
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
  background-image: url("../assets/bank.jpg");
  color: #fff;
  text-align: center;
  padding: 300px;
}

.header a {
  color: #fff;
  padding-right: 5px;
  text-decoration: none;
}
</style>
