<template>
  <div class="chat">
    <header class="header">
      <h3>Start Chatting</h3>
    </header>
    <div class="chat-box-list-container" ref="chatbox">
      <ul class="chat-box-list">
        <li v-for="(message, idx) in messages" :key="idx" :class="message.author">
          <p>
            <span>{{ message.text }}</span>
          </p>
        </li>
      </ul>
    </div>
    <v-footer fixed width="100%">
      <v-textarea
        auto-grow
        rows="2"
        placeholder="Start typing..."
        filled
        type="text"
        v-model="message"
        @keyup.enter="sendMessage"
      />
      <v-btn right height="60px" @click="sendMessage">Send</v-btn>
    </v-footer>
  </div>
</template>

<script>
import rainbowSDK from "rainbow-web-sdk";
// import moment from "moment";

export default {
  name: "Chatbot",
  components: {},
  data: () => ({
    message: "",
    messages: []
  }),
  created() {
    document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, this.onLoaded);
    rainbowSDK.start();
    rainbowSDK.load();
  },
  methods: {
    gettingConnection: function() {
      console.log("here in chatbot page");
      //get agent token id
      //sign in to rainbow using token id
      var applicationID = "";
      var applicationSecret = "";
      rainbowSDK.setVerboseLog(false);
      rainbowSDK.connection.signin(applicationID, applicationSecret);
      console.log("signed in");
    },
    sendMessage() {
      const message = this.message;
      this.messages.push({
        text: message,
        author: "client"
      });
      this.message = "";
      //below is replying to user
      // this.$axios
      //   .get(
      //     `https://www.cleverbot.com/getreply?key=CC8uqcCcSO3VsRFvp5-uW5Nxvow&input=${message}`
      //   )
      //   .then(res => {
      //     this.messages.push({
      //       text: res.data.output,
      //       author: "server"
      //     });
      //     this.$nextTick(() => {
      //       this.$refs.chatbox.scrollTop = this.$refs.chatbox.scrollHeight;
      //     });
      //   });
    }
  }
};
</script>
<style scoped lang="scss">
.chat-box-list {
  display: flex;
  flex-direction: column;
  list-style-type: none;
}
.chat-box-list-container {
  // overflow: scroll;
  margin-bottom: 1px;
}
.chat-box-list {
  padding-left: 10px;
  padding-right: 10px;
  span {
    padding: 8px;
    color: white;
    border-radius: 4px;
  }
  .server {
    span {
      background: #99cc00;
    }
    p {
      float: right;
    }
  }
  .client {
    span {
      background: #0070c8;
    }
    // p {
    //   float: left;
    // }
  }
}
.client {
  margin-left: auto !important;
}

.chat-box {
  margin: 10px;
  border: 1px solid #999;
  width: 90vw;
  height: 90vh;
  border-radius: 4px;
  margin-left: auto;
  margin-right: auto;
  align-items: space-between;
  justify-content: space-between;
}
.header {
  background: #6e27be;
  color: #fff;
  text-align: center;
  padding: 40px;
}
</style>
