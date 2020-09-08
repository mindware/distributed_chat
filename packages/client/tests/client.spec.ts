// Test suite for instantiating and kicking off websocket clients
// for basic channel joining stages

import { assert } from 'chai'
import {
  PublicChannelClient, WebSocketConnectionManager, integer, JSONDatum, Stage,
} from '..'

describe('WebSocket clients', () => { // eslint-disable-line no-undef
  const wsc1 = new WebSocketConnectionManager({
    host: 'localhost',
    port: 8546 as integer,
    useWSS: false, // local instance won't have TLS enabled
  });

  const wsc2 = new WebSocketConnectionManager({
    host: 'localhost',
    port: 8546 as integer,
    useWSS: false, // local instance won't have TLS enabled
  });

  const client = new PublicChannelClient('wizards', 'iceking', wsc1);

  const client2 = new PublicChannelClient('wizards', 'abracadaniel', wsc2)

  it('has three remaining stages', async () => { // eslint-disable-line no-undef
    assert.equal(client.getBuilder().getClientState().remainingStageCreators.count(), 2,
      'Expected 2 remaining stage creators for public channel client.')
  })

  it('joins a public channel', async () => { // eslint-disable-line no-undef

    const expectedMessages = [
      'hello2',
      'MESSAGE SENT',
      'Connected to channel wizards',
    ]

    const listenerFunc = (preStage: Stage, postStage: Stage, userDatum: JSONDatum) => {
      assert.equal(userDatum.msg, expectedMessages.pop())
    }
    const prom1 = new Promise((resolve, reject) => {
      const wrappedListenerFunc = (preStage: Stage, postStage: Stage, userDatum: JSONDatum) => {
        try {
          listenerFunc(preStage, postStage, userDatum)
          resolve(true)
        } catch (e) {
          reject(e)
        }
      }
      client.addStageListener('publicMessage', 'publicMessage', wrappedListenerFunc)
    })

    await client.enqueueMessage('hello1');
    await client2.enqueueMessage('hello2');

    await client.start();
    await client2.start()
    await prom1

    // client.removeStageListener(listenerId)

  });
});