let instance

/**
 * 统一的音效管理器
 */
class Music {
  constructor() {
    if (instance)
      return instance

    instance = this

    this.bgmAudio = new Audio()
    this.bgmAudio.loop = true
    this.bgmAudio.src = 'audio/bgm.mp3'

    this.playerAudio = new Audio()
    this.playerAudio.src = 'audio/player.mp3'

    this.aiAudio = new Audio()
    this.aiAudio.src = 'audio/ai.mp3'

    this.playBgm()
  }

  playBgm() {
    this.bgmAudio.play()
  }
  playplayer() {
    this.playerAudio.currentTime = 0
    this.playerAudio.play()
  }
  playai(){
    this.aiAudio.currentTime = 0
    this.aiAudio.play()
  }
}