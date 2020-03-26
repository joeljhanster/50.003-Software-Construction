<template>
  <div class="chat">
    <header class="header">
      <h3>Start Chatting</h3>
    </header>
    <v-navigation-drawer id = "drawer" v-model = "drawer">
        <p>Hello, {{name}}</p>
        <v-list>
          <v-list-item name = "toHomebutton" :to="{ name: 'Home' }">Logout</v-list-item>
        </v-list>
      </v-navigation-drawer>
    <div class="chatBox" id="chatBox" ref="chatBox">
      <v-card flat class="chat-box-list-container" ref="chatbox" fluid>
        <ul class="chat-box-list" style="word-break: break-all">
          <li v-for="message in messages" :key="message.messages" v-bind:class="message.author">
            <p>
              <v-container>
                <span>{{ message.text }}</span>
              </v-container>
            </p>
            <v-card-subtitle class="white--text text-right pr-2 pb-1">
              {{ message.author }}
              {{ message.time }}
            </v-card-subtitle>
          </li>
        </ul>
      </v-card>
    </div>
    <v-footer id="footer" fixed width="100%">
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
import moment from "moment";
import axios from "axios";
// import $ from "jquery";

export default {
  name: "Chatbot",
  props: ["firstname", "lastname"],
  components: {},
  data: () => ({
    agentId: "",
    message: "",
    messages: [
      {
        text: "Type #support for help.",
        author: "Agent",
        time: moment().format("h:mm a")
      }
    ],
    conversation: ""
  }),
  created() {
    console.log(this.$route.params);
  },
  methods: {
    gettingConnection: async function() {
      // console.log(this.$route.params.firstname);
      let self = this;
      try {
        let response = await axios.get(
          `https://limitless-sierra-11102.herokuapp.com/create_guest?firstName=${this.$route.params.firstname}&lastName=${this.$route.params.lastname}`
        );
        self.guestId = response.data.id;
        self.email = "agent1@sutd.edu.sg";
        self.password = "P@ssword123";
        console.log(this.guestId);
        console.log(this.email);
        console.log(this.password);
        if (this.guestId) {
          this.gettingConvo();
        } else {
          console.log("can't find id");
        }
      } catch (err) {
        console.log(err);
      }
    },
    gettingConvo: async function() {
      try {
        console.log("here");
        await rainbowSDK.connection.signin(this.email, this.password);
        //bot contact
        let contact = await rainbowSDK.contacts.searchById(
          "5e3298a2e9f12730636949d2"
        );
        console.log(contact);
        //open conversation for bot
        this.conversation = await rainbowSDK.conversations.openConversationForContact(
          contact
        );
        console.log(this.conversation);
        console.log(this.conversation.messages);
        //detting messages from bot
        await rainbowSDK.im.getMessagesFromConversation(this.conversation, 50);
        document.addEventListener(
          rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED,
          this.receive
        );

        document.addEventListener(
          rainbowSDK.im.RAINBOW_ONNEWIMRECEIPTRECEIVED,
          this.receipt
        );
      } catch (err) {
        console.log(err);
      }
    },
    sendMessage() {
      // console.log("sent");
      if (this.message != "") {
        rainbowSDK.im.sendMessageToConversation(
          this.conversation,
          this.message
        );
        this.messages.push({
          text: this.message,
          author: "client",
          time: moment().format("h:mm a")
        });
        this.message = "";
        this.$nextTick(() => {
          this.$refs.chatbox.scrollTop = this.$refs.chatbox.scrollHeight;
        });
      }
    },
    //when message received
    receive: function(event) {
      console.log("receive");
      console.log(event.detail.message.data);
      console.log(event.detail.message.side);
      console.log("hello");
      this.messages.push({
        text: event.detail.message.data,
        author: "Agent",
        time: moment().format("h:mm a")
      });
    },
    //when you send out message
    receipt: function(event) {
      console.log("receipt");
      console.log(event.detail.message.data);
      console.log(event.detail.message.side);
    }
  },
  mounted() {
    const self = this;
    window.addEventListener("keyup", function(event) {
      if (event.keyCode == 13) {
        self.sendMessage();
      }
    });
    this.gettingConnection();
  }
};
</script>
<style scoped lang="scss">
.chat-box-list {
  display: flex;
  flex-direction: column;
  list-style-type: none;
  padding-bottom: 90px;
}
.chat-box-list-container {
  overflow-y: scroll;
  margin-bottom: 1px;
  overflow-x: hidden;
}
.chat-box-list {
  padding-left: 10px;
  padding-right: 10px;
  span {
    padding: 8px;
    color: white;
    border-radius: 4px;
  }
  .Agent {
    span {
      background: #99cc00;
      padding: 16px;
      display: grid;
    }
    p {
      float: right;
    }
  }
  .client {
    span {
      background: #0070c8;
      padding: 16px;
      display: grid;
    }
    // p {
    //   float: left;
    // }
  }
}
.Agent {
  margin-right: auto !important;
}
.client {
  margin-left: auto !important;
}
.header {
  background: #6e27be;
  color: #fff;
  text-align: center;
  padding: 40px;
}
.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 50px;
  text-align: center;
  background-color: #ccc;
}
</style>
