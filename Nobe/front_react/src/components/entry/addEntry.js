import React, { Component } from 'react'
import Dropzone from 'react-dropzone'

import axios from 'axios';

import ImagesReview from './imagesReview'

const currentYear = new Date().getYear() + 1900;
const base_url = 'http://127.0.0.1:8000'

function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i].name === a[j].name)
                a.splice(j--, 1);
        }
    }

    return a;
}

function yearBiggerThanCurrent(year) {
    return parseInt(year) > currentYear;
}

class AddEntry extends Component {
    constructor(props){
        super(props)

        this.state = {
            title:'',
            year: '',
            author: '',
            images: [],
            errorMessage: '',

            new_entry_id: '',
            new_entry_imgs: '',
            new_entry_img_index: 0,
            modal_display: 'none',
            lightbox_display: 'none',
        }

        this.onChangeTitle = this.onChangeTitle.bind(this);
        this.onChangeAuthor = this.onChangeAuthor.bind(this);
        this.onChangeYear = this.onChangeYear.bind(this);

        this.onSubmit = this.onSubmit.bind(this);
        
        this.onFilesUpload = this.onFilesUpload.bind(this);
        this.onImgRemove = this.onImgRemove.bind(this);
        
        this.closeModal = this.closeModal.bind(this);
    }

    onChangeTitle = (e) => {
        this.setState({
            title: e.target.value,
        })
    }

    onChangeAuthor = (e) => {
        this.setState({
            author: e.target.value,
        })
    }

    onChangeYear = (e) => {
        let year = e.target.value;
        let errorMessage = (year.match(/^[1-9]\d*$|^0$|-[1-9]\d*/g) 
                            ) 
                            ? ""
                            : "El año tiene que ser en un formato válido (01 no es válido)"
        if (errorMessage === "" && yearBiggerThanCurrent(year)) {
            errorMessage = "El año tiene que ser menor o igual que el año actual";
        } 
    
        this.setState({
            year: year,
            errorMessage: errorMessage,
        })
    }

    onFilesUpload = (files) => {
        this.setState({
            images: arrayUnique(this.state.images.concat(files)),
        })
    }

    onImgRemove = (e, name) => {
        e.preventDefault();
        e.stopPropagation();
        var imgs = this.state.images;
        this.setState({
            images: imgs.filter(img => img.name !== name),
        })
    }

    onSubmit(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.state.title){
            this.setState({
                errorMessage: "Introduce título por favor"
            })
            return null;
        }
        
        if (!this.state.author){
            this.setState({
                errorMessage: "Introduce autor por favor"
            })
            return null;
        }

        if (!this.state.year){
            this.setState({
                errorMessage: "Introduce año por favor"
            })
            return null;
        }

        if (yearBiggerThanCurrent(this.state.year) ){
            this.setState({
                errorMessage: "El año tiene que ser menor o igual al actual"
            })
            return null;
        }

        if (this.state.images.length === 0){
            this.setState({
                errorMessage: "Introduce por lo menos una imagen"
            })
            return null;
        }

        const formData = new FormData();
        formData.append("title", this.state.title)
        formData.append("author", this.state.author)
        formData.append("year", this.state.year)
        

        for (const image of this.state.images) {
            formData.append('images', image)
        }

        axios.post(base_url + '/entries/',
            formData,
            {
                headers: {
                    "Content-Type":"multipart/form-data",
                    'Authorization': `Token ${localStorage.getItem("token")}`,
                }
            }
        ).then(
            res => {
                this.setState({
                    title:'',
                    year: '',
                    author: '',
                    images: [],
                    errorMessage: '',
                    new_entry_id: res.data.entry_id,
                    modal_display: '',
                })
            }
        )
    }

    closeModal() {
        this.setState({
            modal_display: 'none',
        })
    }

    render() {   
        return(

            <div className="adduser_wrapper">
                <div style={{display:this.state.modal_display}}>
                    <ImagesReview closeModal={this.closeModal} 
                                entry_id={this.state.new_entry_id}
                                allowAddImage={false}
                                />
                </div>

                <div className="adduser_info_wp">
                    <h3> Añadir un registro </h3>
                </div>

                <div className="form_add_entry height_100">
                    <form>
                        <label>Título</label>
                        <br/>
                        <input  className="addEntry_title"
                                value={this.state.title}
                                onChange={this.onChangeTitle}
                                type="text"
                                />
                        <br/>

                        <label>Autor</label>
                        <br/>
                        <input value={this.state.author}
                                onChange={this.onChangeAuthor}
                                type="text"
                                />

                        <br/>
                        <label>Año de creación</label>
                        <br/>
                        <input value={this.state.year}
                                onChange={this.onChangeYear}
                                type="text"
                                pattern="^[1-9]\d*$|^0$|-[1-9]\d*$"
                                />
                        <label style={{fontSize: "small", 
                                        fontStyle:"italic", 
                                        width:"100%"}}>
                            Los años A.C. se deben poner con un - delante (10 A.C. -> -10)
                        </label>
                        <br/>
                        <br/>
                        
                        <label> Imágenes </label>
                        <br/>

                        <Dropzone
                        onDrop={acceptedFiles => this.onFilesUpload(acceptedFiles)}>
                        {({getRootProps, getInputProps, isDragActive}) => (
                            <section>
                            <div style={{fontSize: "small", fontStyle:"italic"}}> Los nombres de las imagenes tienen que ser únicos </div>
                            <div {...getRootProps()}
                                className="dropzone">
                                <input {...getInputProps()} />
                                {
                                    this.state.images.length === 0
                                    ? isDragActive 
                                        ? <div className="drop_label row">
                                                <p style={{width:"100%"}}>Suelta las imágenes aqui... </p>
                                            </div> 
                                        : <div className="drop_label row">
                                                <p style={{width:"100%"}}> Arrastra y suelta las imágenes, o had click aquí para seleccionar imagenes</p>
                                            </div> 
                                    : null
                                }

                                {
                                    this.state.images.map(
                                        image => (
                                            <div className="addentry_row row"
                                                key={image.name}>
                                                <div className="col-10">{image.name}</div>
                                                <div className="col-2" 
                                                    style={{cursor:"pointer", color:"red"}} 
                                                    onClick={(e) => this.onImgRemove(e, image.name)}> 
                                                        Borrar 
                                                </div>
                                            </div>
                                            )
                                    )
                                }
                            </div>
                            </section>
                        )}
                        </Dropzone>

                        <button 
                            type="submit"
                            className="btn_create_user"
                            onClick={this.onSubmit}
                            style={{marginTop:"10px"}}
                            > 
                            Crear registro </button>
                        <div className="login_error">
                            {this.state.errorMessage}                    
                        </div>

                    </form>
                </div>

                

            </div>
        )
    }
}

export default AddEntry;