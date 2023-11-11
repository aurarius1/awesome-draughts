import {reactive} from "vue";

const url = "wss://localhost:32770/ws";
export const socketState = reactive({
    connected: false,

});

const socket = "";