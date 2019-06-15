import React, { Component } from 'react'

import axios from 'axios';

const base_url = 'http://127.0.0.1:8000'

class ImagesReview extends Component {
    constructor(props){
        super(props)

        this.state = {
            entry_id: this.props.entry_id,
            images: [],
            deleted_imgs: [],
            img_index: 0,
            modal_display: 'none',
            confirm_display: '',
            lightbox_display: 'none',
            delete_img_display: 'none', 
        }
                
        this.childCloseModal = this.childCloseModal.bind(this);
 
        this.reviewImages = this.reviewImages.bind(this);
        this.nextImage = this.nextImage.bind(this);
        this.previousImage = this.previousImage.bind(this);

        this.onChangeText = this.onChangeText.bind(this);
        this.onChangeIndex = this.onChangeIndex.bind(this);
        this.onDeleteImage = this.onDeleteImage.bind(this);

        this.uploadAndClose = this.uploadAndClose.bind(this);
    }

    componentDidMount(){
        this.setState({
            modal_display: '',
        })
    }

    childCloseModal(){
        this.setState({
            deleted_imgs: [],
            img_index: 0,
            modal_display: 'none',
            confirm_display: 'none',
            lightbox_display: 'none',
            delete_img_display: 'none', 
            entry_id: '',
            images: [],
        });
        this.props.closeModal();
    }


    reviewImages(){
        axios.get(`${base_url}/entry/${this.props.entry_id}/`,
            {
                headers: {
                    'Authorization': `Token ${localStorage.getItem("token")}`,
                }
            }
        ).then(
            res => {
                this.setState({
                    modal_display: 'none',
                    lightbox_display: '',
                    images: res.data.entry_images,
                })
            }
        )
    }

    previousImage() {
        const previousIndex = this.state.img_index === 0
                    ? 0
                    : this.state.img_index - 1;

        this.setState({
            img_index: previousIndex,
        })
    }

    nextImage() {
        const nextIndex = this.state.img_index+1 === this.state.images.length
                    ? this.state.img_index 
                    : this.state.img_index + 1;

        this.setState({
            img_index: nextIndex,
        })
    }

    onChangeText(e) {
        var imgs = this.state.images;

        imgs[this.state.img_index].text = e.target.value;

        this.setState({
            images: imgs,
        })
    }

    onChangeIndex = (e) => {
        this.setState({
            img_index: e.target.value,
        })
    }

    uploadAndClose() {
        var data = {
            images: [],
            to_delete: [],
        };
        
        this.state.images.map(
            image => data.images.push({"id":image.id, "text":image.text})
        )

        this.state.deleted_imgs.map(
            image_id => data.to_delete.push({"id":image_id})
        )

        axios.put(base_url + '/images/',
            data,
            {
                headers: {
                    "Content-Type":"multipart/form-data",
                    'Authorization': `Token ${localStorage.getItem("token")}`,
                }
            }
        )
        .then(
            res => {
                window.alert("Cambios guardados correctamente");
                this.setState({
                    entry_id: '',
                    images: [],
                    deleted_imgs: [],
                    img_index: 0,
                })
                this.childCloseModal();
            }
        )
    }

    onDeleteImage(e) {
        e.preventDefault();
        e.stopPropagation();

        if(this.state.images.length > 1){
            var confirm = window.confirm("¿Confirmar borrar la imagen?")

            if(confirm){
                var imgs = this.state.images;
                var deleted_imgs = this.state.deleted_imgs;

                var deleted_img = imgs.splice(this.state.img_index, 1)
                deleted_imgs.push(deleted_img[0].id)

                var newIndex = (this.state.img_index === imgs.length)
                    ? imgs.length-1
                    : this.state.img_index

                this.setState({
                    images: imgs,
                    deleted_imgs: deleted_imgs,
                    img_index: newIndex,
                })
            }
        } else {
            window.alert("No se pueden borrar todas las imagenes")
        }        
    }


    render() {
        const style1 = {position: 'fixed', inset: '0px', backgroundColor: 'transparent', zIndex: 1000}
        const style2 = {position: 'absolute', inset: '0px', border: 'medium none', background: 'transparent none repeat scroll 0% 0%', overflow: 'hidden', borderRadius: '0px', outline: 'currentcolor none medium', padding: '0px'}
        const style3 = {transition: 'opacity 300ms ease 0s', animationDuration: '300ms', animationDirection: 'reverse'}
        
        if(!this.state.images){
            return <div></div>
        }

        return(

            <div>
                <div className="modal_entry"
                    style={{display:this.state.modal_display}}
                    >
                    <div className="modal_entry_detail"
                        style={{display:this.state.delete_img_display}}
                        >

                    </div>  

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
                    <div className="ReactModal__Overlay ReactModal__Overlay--after-open" 
                        style={style1}>

                        <div style={style2} 
                             className="ReactModal__Content ReactModal__Content--after-open" 
                             tabIndex="-1" 
                             role="dialog" 
                             aria-label="Lightbox">

                        {
                            this.state.images.length > 0
                            ? <div className="ril-outer ril__outer ril__outerAnimating  " 
                                style={style3} 
                                tabIndex="-1">

                                <div className="ril-inner ril__inner">
                                    <div className="review_modal"> 
                                        <div className="row review_selector">
                                        {/* pagination */}
                                            <select
                                                onChange={this.onChangeIndex}
                                                value={this.state.img_index}
                                                >
                                                {this.state.images.map((x, i) => (
                                                    <option value={i}
                                                            key={i}
                                                            >
                                                        {`Imagen ${i+1} de ${this.state.images.length}`}
                                                    </option> 
                                                ))}
                                            </select>
                                        </div>
                                        <div className="row review_content">
                                            {/* content */}
                                            <div className="col-6 review_image_image">
                                                <img src={base_url + this.state.images[this.state.img_index].image}
                                                    alt="Imagen a revisar" />
                                            </div>
                                            <div className="col-6 review_image_form">
                                                <form>
                                                    <label style={{textAlign: "left"}}>Texto de la imagen</label>
                                                    <br/>
                                                    <textarea  className="edditImage_text"
                                                            value={this.state.images[this.state.img_index].text}
                                                            onChange={this.onChangeText}
                                                            type="text"
                                                            required
                                                            />

                                                    <button className="btn btn-danger"
                                                        style={{margin:"5px 0px"}}
                                                        onClick={(e) => this.onDeleteImage(e)}
                                                        type="button"
                                                        >
                                                        Borrar imagen
                                                        </button>
                                                </form>
                                            </div>
                                        </div>
                                        <div className="row review_generalActions">
                                            {/* general buttons */}
                                            <div className="warn"
                                                style={{width:"100%", textAlign:"center"}}
                                            >
                                                    Ningún cambio se guardará (incluyendo las imágenes borradas) 
                                                    hasta que se pulse el botón Guardar los cambios y salir
                                            </div>
                                            { this.props.allowAddImage
                                                ? <button>Añadir imagen</button>
                                                : null
                                            }
                                            <button
                                                type="button" 
                                                className="btn btn-secondary" 
                                                aria-label="Salir sin guardar cambios"
                                                onClick={this.childCloseModal}
                                                >
                                                Salir sin guardar cambios
                                                </button>
                                            <button
                                                type="button" 
                                                className="btn btn-primary" 
                                                aria-label="Guardar cambios y salir"
                                                onClick={this.uploadAndClose}
                                                >
                                                Guardar los cambios y salir
                                                </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <button type="button" 
                                        className="navigation_btn ril-prev-button ril__navButtons ril__navButtonPrev" 
                                        aria-label="Previous image"
                                        onClick={this.previousImage}
                                        disabled={
                                            this.state.img_index === 0
                                        }
                                        >
                                        </button>
                                <button type="button" 
                                        className="navigation_btn ril-next-button ril__navButtons ril__navButtonNext" 
                                        aria-label="Next image"
                                        onClick={this.nextImage}
                                        disabled={
                                            this.state.img_index === this.state.images.length-1
                                        }
                                        >
                                        </button>
                        
                                </div>

                            : null
                        }
                            
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ImagesReview;