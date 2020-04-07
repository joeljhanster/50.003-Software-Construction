const {MongoClient} = require('mongodb');

describe('mongodb test', () => {
  let client;
  let db;
  let bank_col;
  let genEnq_col;
  let investment_col

  const url = 'mongodb://heroku_1whs0tq1:kq8e627o53cv9trrtd6q07n00i@ds119728.mlab.com:19728/heroku_1whs0tq1';    // Connection url
  const dbName = 'heroku_1whs0tq1';           // Database Name

  beforeAll(async () => {
    client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    db = await client.db(dbName);
    bank_col = db.collection('banking');
    genEnq_col = db.collection('generalEnquiries');
    investment_col = db.collection('investment');
  });

  afterAll(async () => {
    await client.close();
    await db.close();
  });

  it('should insert a doc into collection', async () => {
    const mockAgent = {jid: 'some-agent-jid', id: 'some-agent-id', displayName: 'AgentX', loginEmail: 'some-agent-email', presence: 'offline', callsReceived: 0, chatsReceived: 0};
    await bank_col.insertOne(mockAgent);

    const insertedAgent = await bank_col.findOne({id: 'some-agent-id'});
    expect(insertedAgent).toEqual(mockAgent);

    await bank_col.deleteOne({id: 'some-agent-id'});
  }); 

  it('count bank documents', async () => {
    const bankCount = await bank_col.countDocuments();
    expect(bankCount).toEqual(4);
  })

  it('count genEnq documents', async () => {
    const genEnqCount = await genEnq_col.countDocuments();
    expect(genEnqCount).toEqual(3);
  })

  it('count investment documents', async () => {
    const investmentCount = await investment_col.countDocuments();
    expect(investmentCount).toEqual(3);
  })

  it("set agent's presence to busy", async () => {
    await bank_col.updateOne({"id": "5e5ff0c9d8084c29e64eb392"}, {$set:{"presence": "busy"}});
    const doc = await bank_col.findOne({"id": "5e5ff0c9d8084c29e64eb392"});
    const presence = doc.presence;
    expect(presence).toEqual("busy");

    await bank_col.updateOne({"id": "5e5ff0c9d8084c29e64eb392"}, {$set:{"presence": "offline"}});
    const newdoc = await bank_col.findOne({"id": "5e5ff0c9d8084c29e64eb392"});
    const newpresence = newdoc.presence;
    expect(newpresence).toEqual("offline");
  })

  it("increase and decrease agent's chat count", async () => {
    const initialDoc = await bank_col.findOne({"id": "5e5ff0c9d8084c29e64eb392"});
    const initialCount = initialDoc.chatsReceived;

    // Increase agent's chat count
    await bank_col.updateOne({"id": "5e5ff0c9d8084c29e64eb392"}, {$inc:{"chatsReceived": 1}});
    const finalDoc = await bank_col.findOne({"id": "5e5ff0c9d8084c29e64eb392"});
    const finalCount = finalDoc.chatsReceived;
    expect(finalCount).toEqual(initialCount + 1);

    // Decrease agent's chat count
    await bank_col.updateOne({"id": "5e5ff0c9d8084c29e64eb392"}, {$inc:{"chatsReceived": -1}});
    const doc = await bank_col.findOne({"id": "5e5ff0c9d8084c29e64eb392"});
    const count = doc.chatsReceived;
    expect(count).toEqual(initialCount);
  })
});