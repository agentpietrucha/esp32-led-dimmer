import mqtt from 'mqtt';

declare global {
  var mqttClient: () => Promise<undefined | ReturnType<typeof mqtt.connect>>;
}

let mqttClient: () => Promise<mqtt.MqttClient | undefined>;

if (!globalThis.mqttClient) {
  const client: () => Promise<mqtt.MqttClient | undefined> = () =>
    new Promise((resolve, reject) => {
      console.log('connecting to mqtt');
      const client = mqtt.connect({
        host: 'broker.hivemq.com',
        // host: 'a8a9d2e032084708827f7fef059f8949.s1.eu.hivemq.cloud',
        port: 8883,
        protocol: 'mqtts',
        username: 'karol',
        password: 'Karolkarol1',
      });
      // console.log('client', client);
      client.on('connect', () => {
        console.log('connected');
        resolve(client);
      });
      client.on('error', reject);
    });
  mqttClient = client;
  if (process.env.NODE_ENV !== 'production') globalThis.mqttClient = client;
} else {
  mqttClient = globalThis.mqttClient;
}

export default mqttClient!;
