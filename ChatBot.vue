<template>
    <div class="chat">
        <header class="header">
            <span class="icon">
                <v-btn
                    :to="{ name: 'Home' }"
                    x-large
                    name="toHomebutton"
                    @click="endChat"
                >
                    <i
                        id="fontHouse"
                        class="fas fa-house-user"
                        name="toHomebutton"
                        fa-4x
                    >
                        <br />
                        <a>Home</a>
                    </i>
                </v-btn>
            </span>
            <h2>Chatting</h2>
        </header>
        <div class="chatBox" id="chatBox" ref="chatBox">
            <v-card flat class="chat-box-list-container" ref="chatbox" fluid>
                <ul class="chat-box-list" style="word-break: keep-all">
                    <li
                        v-for="message in messages"
                        :key="message.text"
                        v-bind:class="message.author"
                    >
                        <p>
                            <v-container>
                                <span>{{ message.text }}</span>
                            </v-container>
                        </p>
                        <v-card-subtitle
                            class="white--text text-right pr-2 pb-1"
                        >
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
                name="msgbox"
                rows="2"
                placeholder="Start typing..."
                filled
                type="text"
                v-model="txt"
            />
            <!-- <img :src="imageUrl" class="img-fluid" /> -->
            <i class="fas fa-paperclip fa-2x fa-fw" @click="onPickFile"></i>
            <v-btn right height="60px" @click="sendMessage">Send</v-btn>
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
        guestId: "",
        file: "",
        flag: false,
        message: "",
        icons: {
            iconfont: "md"
        },
        imageUrl: "",
        image: null,
        txt: "",
        selectedFile: null,
        messages: [
            {
                text: "Type #support for help.",
                author: "Bank",
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
                self.email = response.data.loginEmail;
                self.password = response.data.password;
                console.log("this is guest id:" + this.guestId);
                console.log(this.email);
                console.log(this.password);
                if (this.guestId) {
                    this.gettingConvo();
                    // await this.$nextTick();
                    // this.$nextTick(function() {
                    //   console.log(this.guestId);
                    // });
                } else {
                    console.log("can't find id");
                }
            } catch (err) {
                console.log(err);
            }
            // },
            // checking: async function() {
            //   let response = await axios.get(
            //     `https://limitless-sierra-11102.herokuapp.com/establish_connection?id=${this.guestId}`
            //   );
            //   while (this.flag == false) {
            //     if (response.data.connection == true) {
            //       console.log(response.data.agentId);
            //       this.agentComeIn();
            //       this.flag = true;
            //     }
            //   }
        },
        gettingConvo: async function() {
            try {
                await rainbowSDK.connection.signin(this.email, this.password);
                console.log("signed in");
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
                //detecting messages from bot
                await rainbowSDK.im.getMessagesFromConversation(
                    this.conversation
                );
                document.addEventListener(
                    rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED,
                    this.receive
                );
                document.addEventListener(
                    rainbowSDK.im.RAINBOW_ONNEWIMRECEIPTRECEIVED,
                    this.receipt
                );
                let self = this;
                console.log(this.guestId);
                while (this.flag == false) {
                    try {
                        let response = await axios.get(
                            `https://limitless-sierra-11102.herokuapp.com/establish_connection?id=${this.guestId}`
                        );
                        if (response.data.connection == true) {
                            console.log(response.data.agentId);
                            console.log(response.data.connection);
                            console.log(response);
                            self.agentId = response.data.agentId;
                            console.log(self.agentId);
                            let contact = await rainbowSDK.contacts.searchById(
                                self.agentId
                            );
                            console.log(contact);
                            this.conversation = await rainbowSDK.conversations.openConversationForContact(
                                contact
                            );
                            console.log(this.conversation);
                            console.log(this.conversation.messages);
                            await rainbowSDK.im.getMessagesFromConversation(
                                this.conversation
                            );
                            document.addEventListener(
                                rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED,
                                this.receive1
                            );
                            document.addEventListener(
                                rainbowSDK.im.RAINBOW_ONNEWIMRECEIPTRECEIVED,
                                this.receipt
                            );
                            this.flag = true;
                        }
                    } catch (err) {
                        console.log(err);
                    }
                }
            } catch (err) {
                console.log(err);
            }
        },
        sendMessage() {
            if (this.txt != "") {
                let message = this.txt;
                rainbowSDK.im.sendMessageToConversation(
                    this.conversation,
                    message
                );
                this.messages.push({
                    text: message,
                    author: "client",
                    time: moment().format("h:mm a")
                });
                // this.$nextTick(() => {
                //   this.$refs.chatbox.scrollTop = this.$refs.chatbox.scrollHeight;
                // });
                this.txt = "";
            }
            // },
            // agentComeIn: async function() {
            //   let self = this;
            //   console.log(this.guestId);
            //   while (this.guestId) {
            //     try {
            //       let response = await axios.get(
            //         `https://limitless-sierra-11102.herokuapp.com/establish_connection?id=${this.guestId}`
            //       );
            //       if (response.data.connection == true) {
            //         console.log(response.data.connection);
            //         console.log(response);
            //         self.agentId = response.data.agentId;
            //         console.log(self.agentId);
            //         let contact = await rainbowSDK.contacts.searchById(self.agentId);
            //         this.conversation = await rainbowSDK.conversations.openConversationForContact(
            //           contact
            //         );
            //         console.log(this.conversation);
            //         console.log(this.conversation.messages);
            //         await rainbowSDK.im.getMessagesFromConversation(this.conversation);
            //         document.addEventListener(
            //           rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED,
            //           this.receive
            //         );
            //         document.addEventListener(
            //           rainbowSDK.im.RAINBOW_ONNEWIMRECEIPTRECEIVED,
            //           this.receipt
            //         );
            //         this.flag = true;
            //       }
            //     } catch (err) {
            //       console.log(err);
            //     }
            //   }
            //get token id from agent backend
            // self.email = "agent1@sutd.edu.sg";
            // self.password = "P@ssword123";
        },
        //when message received
        receive: function(event) {
            console.log(event.detail.message.data);
            console.log(event.detail.message.side);
            this.messages.push({
                text: event.detail.message.data,
                author: "Bank",
                time: moment().format("h:mm a")
            });
        },
        receive1: function(event) {
            console.log(event.detail.message.data);
            console.log(event.detail.message.side);
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
        },
        endChat() {},
        onPickFile() {
            this.$refs.fileInput.click();
        },
        onFilePicked: function(event) {
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
                this.image = files[0];
                console.log(this.image);
                // console.log(file);
            }
            rainbowSDK.fileStorage
                .uploadFileToConversation(
                    this.conversation,
                    this.image,
                    "My message"
                )
                .then(function(message) {
                    console.log("file send");
                    console.log(message);
                })
                .catch(function(err) {
                    console.log(err);
                });
            console.log(event);
            let onNewMessageReceived = function(event) {
                console.log(event.message.fieldId);
                console.log(event);
                let message = event.message;
                console.log(message);
                if (message.fileId) {
                    let fileDescriptor = rainbowSDK.fileStorage.getFileDescriptorFromId(
                        message.fileId
                    );
                    console.log(fileDescriptor);
                }
            };
            document.addEventListener(
                rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED,
                onNewMessageReceived
            );
            rainbowSDK.fileStorage
                .getFilesReceivedInConversation(this.conversation)
                .then(function(files) {
                    // Do something with the list of files received in a conversation
                    console.log(files);
                });
        }
    },
    // }

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
        this.gettingConnection();
        // this.checking();
        // this.agentComeIn();
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
    line-height: 45px !important;
    top: 40px;
    position: relative;
}
</style>
