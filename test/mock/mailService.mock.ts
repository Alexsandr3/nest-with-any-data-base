

export class MailServiceMock {
  constructor(e) {
  }

  async sendUserConfirmation(email: string, code: string) {
   return true
  }

  async sendPasswordRecoveryMessage(email, code: string) {
   return true
  }

  async sendEmailRecoveryMessage(email, code: string) {
   return true
  }
}
