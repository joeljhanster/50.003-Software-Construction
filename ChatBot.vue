<template>
  <div class="chat">
    <transition name="fade">
      <Loading v-bind:isConnecting="isConnecting" v-if="!start" />
    </transition>
    <div class="chatBox" id="chatBox" ref="chatBox">
      <header class="header">
        <span class="icon">
          <v-btn :to="{ name: 'Home' }" x-large name="toHomebutton" @click="endChat">
            <i id="fontHouse" class="fas fa-house-user" name="toHomebutton" fa-4x>
              <br />
              <a>Home</a>
            </i>
          </v-btn>
        </span>
        <h2>Chatting</h2>
      </header>
      <!-- <div class="chatBox" id="chatBox" ref="chatBox"> -->
      <v-card flat class="chat-box-list-container" ref="chatbox" fluid>
        <ul class="chat-box-list" style="word-break: keep-all">
          <li v-for="message in messages" :key="message.text" v-bind:class="message.author">
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
      <!-- </div> -->
      <v-footer id="footer" fixed width="100%">
        <v-textarea
          auto-grow
          name="msgbox"
          rows="2"
          placeholder="Start typing..."
          filled
          type="text"
          v-model="txt"
        />
        <!-- <img :src="imageUrl" class="img-fluid" /> -->
        <i class="fas fa-paperclip fa-2x fa-fw" @click="onPickFile"></i>
        <i name="toCall" class="fas fa-phone-square fa-3x" @click="call"></i>
        <v-btn name="msgbutton" right height="60px" @click="sendMessage">Send</v-btn>
      </v-footer>
      <input
        type="file"
        style="display: none"
        ref="fileInput"
        id="fileUpload"
        accept="image/*"
        @change="onFilePicked"
      />
    </div>
  </div>
</template>

<script>
import rainbowSDK from "rainbow-web-sdk";
import moment from "moment";
import axios from "axios";
import Loading from "./Loading";

export default {
  name: "Chatbot",
  props: ["firstname", "lastname"],
  components: { Loading },
  data: () => ({
    agentId: "",
    guestId: "",
    file: "",
    flag: false,
    message: "",
    icons: {
      iconfont: "md"
    },
    imageUrl: "",
    image: "",
    txt: "",
    skill: "",
    isConnecting: false,
    start: false,
    selectedFile: "",
    messages: [
      {
        text:
          "Type #support for help or type #availability to see the number of agents currently available.",
        author: "Bank",
        time: moment().format("h:mm a")
      }
    ],
    conversation: ""
  }),
  created() {
    console.log(this.$store.state.count);
    console.log(this.$route.params);
    this.gettingConnection();
  },
  methods: {
    //changed all the this to self including this.conversation
    gettingConnection: async function() {
      let self = this;
      try {
        let response = await axios.get(
          `https://limitless-sierra-11102.herokuapp.com/create_guest?firstName=${this.$route.params.firstname}&lastName=${this.$route.params.lastname}`
        );
        self.guestId = response.data.id;
        self.email = response.data.loginEmail;
        self.password = response.data.password;
        console.log("this is guest id:" + this.guestId);
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
      let self = this;
      try {
        await rainbowSDK.connection.signin(this.email, this.password);
        console.log("signed in");
        //bot contact
        let contact = await rainbowSDK.contacts.searchById(
          "5e3298a2e9f12730636949d2"
        );
        console.log(contact);
        //open conversation for bot
        self.conversation = await rainbowSDK.conversations.openConversationForContact(
          contact
        );
        console.log(self.conversation);
        console.log(self.conversation.messages);
        //detecting messages from bot
        await rainbowSDK.im.getMessagesFromConversation(self.conversation);
        document.addEventListener(
          rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED,
          self.receive
        );
        self.start = true;
        document.addEventListener(
          rainbowSDK.im.RAINBOW_ONNEWIMRECEIPTRECEIVED,
          self.receipt
        );
        // let self = this;
        console.log(this.guestId);
        //get token id from agent backend
        // self.email = "agent1@sutd.edu.sg";
        // self.password = "P@ssword123";
        while (this.flag == false) {
          try {
            let response = await axios.get(
              `https://limitless-sierra-11102.herokuapp.com/establish_connection?id=${this.guestId}`
            );
            if (response.data.connection == true) {
              this.flag = true;
              this.agentComeIn();
            }
          } catch (err) {
            console.log(err);
          }
        }
      } catch (err) {
        console.log(err);
      }
    },
    agentComeIn: async function() {
      let self = this;

      // document.removeEventListener(
      //   rainbowSDK.im.RAINBOW_ONNEWIMRECEIPTRECEIVED,
      //   self.receipt
      // );
      let response = await axios.get(
        `https://limitless-sierra-11102.herokuapp.com/establish_connection?id=${this.guestId}`
      );
      console.log(response.data.agentId);
      console.log(response.data.connection);
      console.log(response.data.skill);
      this.$store.state.agentId = response.data.agentId;
      console.log(this.$store.state.agentId);
      this.skill = response.data.skill;
      console.log(response);
      self.agentId = response.data.agentId;
      console.log(self.agentId);
      let contact = await rainbowSDK.contacts.searchById(self.agentId);
      console.log(contact);
      self.conversation = await rainbowSDK.conversations.openConversationForContact(
        contact
      );
      console.log(self.conversation);
      console.log(self.conversation.messages);
      await rainbowSDK.im.sendMessageToConversation(
        this.conversation,
        `Hello, I am ${this.$route.params.firstname} and I need help in ${this.skill} `
      );
      document.removeEventListener(
        rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED,
        self.receive
      );
      await rainbowSDK.im.getMessagesFromConversation(this.conversation);
      document.addEventListener(
        rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED,
        self.receive1
      );
      document.addEventListener(
        rainbowSDK.im.RAINBOW_ONNEWIMRECEIPTRECEIVED,
        self.receipt
      );
    },
    call() {
      // this.$alert("Do you want to call your agent?");
      this.$confirm("Do you want to call the agent?").then(() => {
        //do something...
        this.callingAgent();
      });
    },
    callingAgent: async function() {
      console.log(this.agentId);
      let self = this;
      let response = await axios.get(
        `https://limitless-sierra-11102.herokuapp.com/create_guest?firstName=${this.$route.params.firstname}&lastName=${this.$route.params.lastname}`
      );
      self.guestId = response.data.id;
      console.log(self.guestId);
      let response1 = await axios.get(
        `https://limitless-sierra-11102.herokuapp.com/establish_connection?id=${this.guestId}`
      );
      console.log(response1.data.connection);
      self.agentId = response1.data.agentId;
      console.log(self.agentId);
      this.checkCall();
      this.startCall();
      // this.$router.push({
      //     name: "call",
      //     params: { agentId: self.agentId }
      // });
    },
    checkCall: function() {
      if (rainbowSDK.webRTC.canMakeAudioVideoCall()) {
        console.log("Browser supports calls");
      } else {
        console.log("Browser does not support calls");
      }
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(function(stream) {
          stream.getTracks().forEach(function(track) {
            track.stop();
          });
          navigator.mediaDevices
            .enumerateDevices()
            .then(function(devices) {
              devices.forEach(function(device) {
                if (device.deviceId === "default") {
                  console.log(device);
                  console.log(device.label, "is available");
                }
              });
            })
            .catch(function(error) {
              console.log(error);
            });
          rainbowSDK.webRTC.useMicrophone("default");
          rainbowSDK.webRTC.useSpeaker("default");
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    startCall: async function() {
      let self = this;
      try {
        console.log(this.agentId);
        let contact = await rainbowSDK.contacts.searchById(this.agentId);
        var res = rainbowSDK.webRTC.callInAudio(contact); //start to call the contact with available agent
        if (res.label === "OK") {
          console.log("calling");
        }
        self.start = true;
        document.addEventListener(
          rainbowSDK.webRTC.RAINBOW_ONWEBRTCCALLSTATECHANGED,
          self.onWebRTCCallChanged
        );
      } catch (err) {
        console.log(err);
      }
    },
    onWebRTCCallChanged: async function(event) {
      let self = this;
      self.call = event.detail;
      console.log("OnWebRTCCallChanged event", event.detail.status);
      if (event.detail.status.value === "Unknown") {
        document.removeEventListener(
          rainbowSDK.webRTC.RAINBOW_ONWEBRTCCALLSTATECHANGED,
          self.onWebRTCCallChanged
        );
        if (self.exit) {
          await self.$router.push({ name: "chatbot" });
        }
      }
    },
    endCall: async function() {
      let self = this;
      self.exit = true;
      await rainbowSDK.webRTC.release(self.call);
      console.log("Session Ended");
    },
    moveToChat: async function() {
      console.log("moving to chat");
      await rainbowSDK.webRTC.release(this.call);
      await this.$router.push({ name: "chatbot" });
    },
    sendMessage() {
      let self = this;
      if (self.txt != "") {
        let message = self.txt;
        rainbowSDK.im.sendMessageToConversation(self.conversation, message);
        self.messages.push({
          text: message,
          author: "client",
          time: moment().format("h:mm a")
        });
        self.txt = "";
      }
    },
    //when message received
    receive: function(event) {
      let self = this;
      console.log(event.detail.message.data);
      console.log(event.detail.message.side);
      self.messages.push({
        text: event.detail.message.data,
        author: "Bank",
        time: moment().format("h:mm a")
      });
    },
    receive1: function(event) {
      let self = this;
      console.log(event.detail.message.data);
      console.log(event.detail.message.side);
      self.messages.push({
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
    },
    onPickFile() {
      this.$refs.fileInput.click();
    },
    onFilePicked: function(event) {
      let self = this;
      console.log(this.conversation);
      const files = event.target.files;
      let filename = files[0].name;
      if (filename.lastIndexOf(".") <= 0) {
        return alert("Please find a valid file input");
      }
      const fileReader = new FileReader();
      fileReader.addEventListener("load", () => {
        this.imageUrl = fileReader.result;
      });
      fileReader.readAsDataURL(files[0]);
      this.image = files[0];
      let inputElement = document.getElementById("fileUpload");
      console.log(inputElement);
      inputElement.addEventListener("change", handleFiles, false);
      // eslint-disable-next-line no-unused-vars
      let file;
      function handleFiles() {
        console.log("a file is chosen");
        file = inputElement.files[0];
        // let file = inputElement.files[0];
        // console.log(this.file);
        // file = files[0];
        self.image = files[0];
        // file = files[0];
        console.log(self.image);
        // console.log(file);
      }
      console.log(self.conversation);
      return rainbowSDK.fileStorage
        .uploadFileToConversation(self.conversation, self.image, "My message")
        .then(function(message) {
          console.log("file send");
          console.log(message);
          let onNewMessageReceived = function(event) {
            // console.log(event.message.fieldId);s
            // console.log(event);
            let message = event.detail.message;
            let conversation = event.detail.conversation;
            let cc = event.detail.cc;
            console.log(conversation);
            console.log(cc);
            console.log(message);
            if (message.fileId) {
              let fileDescriptor = rainbowSDK.fileStorage.getFileDescriptorFromId(
                message.fileId
              );
              console.log(fileDescriptor);
            }
          };
          rainbowSDK.im.sendMessageToConversation(this.conversation, message);
          document.addEventListener(
            rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED,
            onNewMessageReceived
          );
          console.log(event);
        })
        .catch(function(err) {
          console.log(err);
        });
      //         console.log(event);
      //         let onNewMessageReceived = function(event) {
      //           console.log(event.message.fieldId);
      //           console.log(event);
      //           console.log(message);
      //           if (message.fileId) {
      //             let fileDescriptor = rainbowSDK.fileStorage.getFileDescriptorFromId(
      //               message.fileId
      //             );
      //             console.log(fileDescriptor);
      //           }
      //         };
      //         document.addEventListener(
      //           rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED,
      //           onNewMessageReceived
      //         );
      //         rainbowSDK.fileStorage
      //           .getFilesSentInConversation(this.conversation)
      //           .then(function(files) {
      //             // Do something with the list of files received in a conversation
      //             console.log(files);
      //           });
    }
  },
  // rainbowSDK.fileStorage
  //   .getFilesReceivedInConversation(this.conversation)
  //   .then(function(files) {
  //     // Do something with the list of files received in a conversation
  //     console.log(files);
  //   });
  // rainbowSDK.fileStorage
  //   .getFilesSentInConversation(this.conversation)
  //   .then(function(files) {
  //     // Do something with the list of files sent in a conversation
  //     console.log(files);
  //   });

  // document.addEventListener(rainbowSDK.FileStorage.RAINBOW_ONFILEUPLOADED);
  mounted() {
    const self = this;
    window.addEventListener("keyup", function(event) {
      if (event.keyCode == 13) {
        self.sendMessage();
      }
    });
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
  .Bank {
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
  .Agent {
    span {
      background: salmon;
      padding: 16px;
      display: grid;
    }
    // p {
    //   float: left;
    // }
  }
}
.Bank {
  margin-right: auto !important;
}
.client {
  margin-left: auto !important;
}
.Agent {
  margin-right: auto !important;
}
.header {
  background: #6e27be;
  color: #fff;
  text-align: center;
  padding: 20px;
}
.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 50px;
  text-align: center;
  background-color: #ccc;
}
.icon {
  margin-right: 6000px;
  font-size: 80px;
  height: 20px;
  vertical-align: middle;
  padding: 40px 45px 40px 35px;
  line-height: 5px !important;
  top: 40px;
  position: relative;
}
.icon2 {
  margin-left: 1500px;
  font-size: 80px;
  height: 20px;
  vertical-align: middle;
  padding: 40px 45px 40px 35px;
  line-height: 5px !important;
  top: 30px;
  position: relative;
}
</style>
