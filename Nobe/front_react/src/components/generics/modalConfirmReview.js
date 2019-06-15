import React, { Component } from 'react'

import LightboxReview from './lightboxEdit'


class ModalConfirmReview extends Component {
    constructor(props){
        super(props)

        this.state = {
            entry_id: this.props.entry_id,
            images: [],
            deleted_imgs: [],
            img_index: 0,
            modal_display: '',
            confirm_display: '',
            lightbox_display: 'none',
        }
                
        this.childCloseModal = this.childCloseModal.bind(this); 
        this.reviewImages = this.reviewImages.bind(this);

    }

    childCloseModal(){
        this.setState({
            modal_display: 'none',
            confirm_display: 'none',
            lightbox_display: 'none',
            entry_id: '',
            images: [],

        });
        this.props.closeModal();
    }


    reviewImages(){
        this.setState({
            modal_display: 'none',
            lightbox_display: '',
        })
    }

    render() {
        return(

            <div>
                <div className="modal_entry"
                    style={{display:this.state.modal_display}}
                    > 

                    <div className="modal_entry_detail"
                        style={{display:this.state.confirm_display}}
                        >
                        <button type="button" 
                                className="close" 
                                id="btn_close_modal" 
                                aria-label="Close" 
                                onClick={this.childCloseModal}>

                            <span aria-hidden="true">&times;</span>
                        </button>
                        <div className="row review_confirmation_msg">
                            Registro creado correctamente, ¿quieres revisar ahora las imagenes?
                            Si eliges no hacerlo, lo puedes hacer más tarde editando el registro
                        </div>
                        <div className="review_confirmation_btns">
                            <button type="button" 
                                    id="edit_user_edit"
                                    className="btn btn-primary" 
                                    onClick={this.reviewImages}>
                                    Editar 
                                    </button>

                            <button onClick={this.childCloseModal} 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    data-dismiss="modal">
                                    No editar
                                    </button>
                        </div>
                        
                    </div>
                </div>

                <div className="reviewWrapper" 
                    style={{display: this.state.lightbox_display}}
                    >
                    <LightboxReview 
                        entry_id={this.props.entry_id}
                        />    
                </div>
            </div>
        )
    }
}

export default ModalConfirmReview;