import { MailAdapter } from "../adapters/mail-adapter";
import { FeedbacksRepository } from "../repositories/feedbacks-repository";

interface SubmitFeedbackUseCaseRequest {
  type: string;
  comment: string;
  screenshot?: string;
}

export class SubmitFeedbackUseCase {

  constructor(
    private feedbacksRepository: FeedbacksRepository,
    private mailAdapter: MailAdapter,
  ) { }

  async execute(request: SubmitFeedbackUseCaseRequest) {

    const { type, comment, screenshot } = request;

    if (!type) {
      throw new Error('Type is required')
    }
    if (!comment) {
      throw new Error('Comment is required')
    }
    if (screenshot && !screenshot.startsWith('data:image/png;base64')) {
      throw new Error('Invalid screenshot format.')
    }

    await this.feedbacksRepository.create({
      type,
      comment,
      screenshot,
    })

    await this.mailAdapter.sendMail({
      subject: `Novo feedback! Do tipo ${type}`,
      body: [
        `<div 
        style="
        font-family: Helvetica, Arial, sans-serif; 
        font-size: 1rem;
        max-width: 40vw;
        background-color: #EFF2F8 ; 
        padding: 30px;
        color:#161320; 
        border-radius: 16px; 
        -moz-box-shadow: -1px 1px 21px -2px rgba(0, 0, 0, 0.5);  
        -webkit-box-shadow: -1px 1px 21px -2px rgba(0, 0, 0, 0.5); 
        box-shadow: -1px 1px 21px -2px rgba(0, 0, 0, 0.5);
        display:flex;
        flex-direction:column;
        align-items: flex-start;
        margin: 0 auto
        ">`,
        `<div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; width: 40vw; ">`,
        `<div>`,
        `<h2>Um novo Feedback foi emitido!</h2>`,
        `</div>`,
        `<div
        style="display: flex; flex-direction: row;justify-content: center; align-items: center; font-size: 1.75rem; margin-right: 2rem;">`,
        `<strong>Feedget</strong>`,
        `</div>`,
        `</div>`,

        `    <hr style="
        width: 30rem ;
        border: 0; 
        height: 2px;
        position: absolute;
        margin-top: 4rem;
        border-radius: 4px; 
        background-color: #996DFF;
        ">`,


        `<p><strong>Tipo do feedback:</strong> ${type}</p>`,
        `<p><strong>Coment??rio:</strong> ${comment}</p>`,

        screenshot
          ?
          `<a style="text-decoration: none; color:#996DFF; font-weight: bolder;" target="_blank" href="${screenshot}">
          Abra a foto em <em>alta resolu????o</em> em uma nova guia ??
          </a> <br> 
          <img style="max-width: 600px;" src="${screenshot}" />`
          :
          `Usu??rio n??o tirou nenhuma foto`,
        `<p style="margin-top: 2rem ; font-size: 0.8rem; color: darkgrey; text-align: start;"> Este email ?? enviado de forma autom??tica, para alterar as configura????es ?? necess??rio alterar os dados no pr??prio servidor. <br>N??o denuncie este email como span, caso contr??rio poder?? gerar atritos com o provedor de email.<br>Qualquer d??vida entrar em contato com nosso suporte: <u>support@feedget.com</u> </p>`,
        `</div>`
      ].join('\n')
    })
  }
}