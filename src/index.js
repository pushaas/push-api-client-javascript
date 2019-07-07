const axios = require('axios')

const createAxiosInstance = ({ endpoint, username, password }) => {
  const instance = axios.create({
    baseURL: endpoint,
    auth: {
      username,
      password,
    },
  })
  instance.interceptors.response.use(response => response.data, error => Promise.reject(error))
  return instance
}

class PushApiClient {
  constructor(options) {
    this.axios = createAxiosInstance(options)
  }

  /*
    ---------------
    channels
    ---------------
  */
  getChannels() {
    return this.axios.get('/api/v1/channels')
  }

  getChannel(id) {
    return this.axios.get(`/api/v1/channels/${id}`)
  }

  deleteChannel(id) {
    return this.axios.delete(`/api/v1/channels/${id}`)
  }

  createChannel(channel = {}) {
    if (!channel.id) {
      return Promise.reject(new Error('[pushApiClient.createChannel] channel.id is required'))
    }
    const defaultData = { ttl: 0 }
    const data = { ...defaultData, ...channel }
    return this.axios.post('/api/v1/channels', data)
  }

  ensureChannel(id, data = {}) {
    return this.getChannel(id)
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          const channel = { ...data, id }
          return this.createChannel(channel)
        }
        throw err
      })
  }

  /*
    ---------------
    config
    ---------------
  */
  getConfig() {
    return this.axios.get('/api/v1/config')
  }

  /*
    ---------------
    messages
    ---------------
  */
  postMessage(message) {
    if (!message.channels || !message.channels.length) {
      return Promise.reject(new Error('[pushApiClient.postMessage] message.channels is required to contain at least one channel id in the list'))
    }

    return this.axios.post('/api/v1/messages', message)
  }

  /*
    ---------------
    stats
    ---------------
  */
  getGlobalStats() {
    return this.axios.get('/api/v1/stats/global')
  }

  getChannelStats(id) {
    return this.axios.get(`/api/v1/stats/channels/${id}`)
  }
}

module.exports = PushApiClient
