import React, { Component } from 'react'

import axios from 'axios';

const base_url = 'http://127.0.0.1:8000'

class LightboxReview extends Component {
    constructor(props){
        super(props) 

        this.state = {
            entry_id: '',
            images: [],
            deleted_imgs: [],
            img_index: 0,
        }
                
        this.childCloseModal = this.childCloseModal.bind(this);
 
        this.nextImage = this.nextImage.bind(this);
        this.previousImage = this.previousImage.bind(this);

        this.onChangeText = this.onChangeText.bind(this);
        this.onChangeIndex = this.onChangeIndex.bind(this);
        this.onDeleteImage = this.onDeleteImage.bind(this);

        this.uploadAndClose = this.uploadAndClose.bind(this);
    }

    componentWillMount(){
        this.setState({
            images: this.props.imgs,
            entry_id: this.props.entry_id,
        })
    }

    childCloseModal(){
        this.setState({
            entry_id: '',
            images: [],
            deleted_imgs: [],
            img_index: 0,
        });

        this.props.closeModal();
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
        const nextIndex = this.state.img_index+1 === this.props.imgs.length
                    ? this.state.img_index 
                    : this.state.img_index + 1;

        this.setState({
            img_index: nextIndex,
        })
    }

    onChangeText(e) {
        var imgs = this.props.imgs;

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
        
        this.props.imgs.map(
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

                this.childCloseModal();
            }
        )
    }

    onDeleteImage(e) {
        e.preventDefault();
        e.stopPropagation();

        if(this.props.imgs.length > 1){
            var confirm = window.confirm("¿Confirmar borrar la imagen?")

            if(confirm){
                var imgs = this.props.imgs;
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

            <div className="reviewWrapper">
                <div className="ReactModal__Overlay ReactModal__Overlay--after-open" 
                    style={style1}>

                    <div style={style2} 
                            className="ReactModal__Content ReactModal__Content--after-open" 
                            tabIndex="-1" 
                            role="dialog" 
                            aria-label="Lightbox">

                    {
                        this.props.imgs.length > 0
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
                                            {this.props.imgs.map((x, i) => (
                                                <option value={i}
                                                        key={i}
                                                        >
                                                    {`Imagen ${i+1} de ${this.props.imgs.length}`}
                                                </option> 
                                            ))}
                                        </select>
                                    </div>
                                    <div className="row review_content">
                                        {/* content */}
                                        <div className="col-6 review_image_image">
                                            <img src={base_url + this.props.imgs[this.state.img_index].image}
                                                alt="Imagen a revisar" />
                                        </div>
                                        <div className="col-6 review_image_form">
                                            <form>
                                                <label style={{textAlign: "left"}}>Texto de la imagen</label>
                                                <br/>
                                                <textarea  className="edditImage_text"
                                                        value={this.props.imgs[this.state.img_index].text}
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
                                        this.state.img_index === this.props.imgs.length-1
                                    }
                                    >
                                    </button>
                    
                            </div>

                        : null
                    }
                        
                    </div>
                </div>
            </div>
        )
    }
}

export default LightboxReview;