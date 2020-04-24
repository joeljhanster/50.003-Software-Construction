const axios = require('axios')

describe('Express API endpoints test', () => {
    it('Test /create_guest endpoint', async done => {
        let firstName = "Mickie"
        let lastName = "Mouse"

        let response = await axios.get(`https://limitless-sierra-11102.herokuapp.com/create_guest?firstName=${firstName}&lastName=${lastName}`)
        expect(response.status).toBe(200)
        expect(response.data.firstName).toBe(firstName)
        expect(response.data.lastName).toBe(lastName)
        expect(response.data).toHaveProperty('loginEmail')
        expect(response.data).toHaveProperty('id')
        expect(response.data).toHaveProperty('password')
        done()
      }, 30000);

    it('Test /establish_connection endpoint', async done => {
        let id;
        let response = await axios.get(`https://limitless-sierra-11102.herokuapp.com/establish_connection?id=${id}`)
        expect(response.status).toBe(200)
        expect(response.data.agentId).toBe("")
        expect(response.data.skill).toBe("")
        expect(response.data).toHaveProperty("agentId")
        expect(response.data).toHaveProperty("skill")
        expect(response.data).toHaveProperty("message")
        expect(response.data).toHaveProperty("connection")
        done()
    }, 30000);

    it('Test /availability endpoint', async done => {
        let response = await axios.get("https://limitless-sierra-11102.herokuapp.com/availability")
        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty("totalBank")
        expect(response.data).toHaveProperty("totalInvest")
        expect(response.data).toHaveProperty("totalGE")
        expect(response.data).toHaveProperty("availBank")
        expect(response.data).toHaveProperty("availInvest")
        expect(response.data).toHaveProperty("availGE")
        done()
    }, 30000);

    it('Test /matched endpoint', async done => {
        let response = await axios.get("https://limitless-sierra-11102.herokuapp.com/matched")
        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty("count")
        done()
    }, 30000);
})