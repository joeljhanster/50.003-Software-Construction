<template>
  <v-app id="inspire">
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Guest Account form</v-toolbar-title>
                <v-spacer />
                <v-tooltip bottom>
                  <span>Source</span>
                </v-tooltip>
                <v-tooltip right>
                  <span>Codepen</span>
                </v-tooltip>
              </v-toolbar>
              <v-card-text>
                <v-form>
                  <v-text-field label="First Name" name="First Name" type="text" />
                  <v-text-field label="Last Name" name="Last Name" type="text" />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="primary" :to="{name: 'Home'}">Back</v-btn>
                <v-btn color="primary" :to="{name: 'chatbot'}">Login</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
export default {
  props: {
    source: String
  }
};
</script>
