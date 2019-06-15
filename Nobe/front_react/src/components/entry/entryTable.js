import React, { Component } from 'react';

import axios from 'axios';

import Dropzone from 'react-dropzone'

import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';

import Slider from 'rc-slider';

import { EntriesList, AuthorList, OrderBySelector, Button } from '../generics/searchGenerics'
import LightboxReview from './lightboxEdit';

import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import UsersTable from '../user/usersTable';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);

const currentYear = new Date().getYear() + 1900;

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

const DeleteModal = ({title, onClick, selectedId, onCancelClick}) => (
    <div 
        style={{height: "auto"}}
        >
        <div className="dm_message">¿Estás seguro de querer borrar el registro {title}?</div>
        <div className="dm_btn_wrapper">
            <button type="button" 
                    className="btn btn-primary" 
                    id="dm_btn_delete"
                    onClick={() => onClick(selectedId)}>
                    Borrar 
                    </button>

            <button onClick={onCancelClick} 
                    type="button" 
                    className="btn btn-secondary" 
                    data-dismiss="modal">
                    Cancelar
                    </button>
        </div>
    </div>
);

function escFunction(event, closeModal){
    if(event.keyCode === 27) {
        closeModal();
    }
}

// Due to setState delay issues, variable managed on a higher level
let page = 0;

class EntryTable extends Component {
    
    constructor(props){
        super(props)

        this.state = {
            data: {},
            query_text: '',
            
            filter_author: '',
            filter_from_year: '',
            filter_to_year: '',
            
            order_by_year: '',
            order_by_author: '',
            order_by_title: '',
            order_by_created: '',

            isLoggedIn: true,

            author:   '',
            min_year: '',
            max_year: '',

            page_size: 5,

            base_url: props.base_url,
            total_elements: 0,

            waiting_to_change: false,

            modal_display: 'none',
            modal_title: '',
            modal_year: '',
            modal_author: '',
            modal_images: [],
            edit_error_message:'',

            display_edit_modal: 'none',
            display_delete_modal: 'none',
            display_edit_imgs_modal:'none',
            display_add_modal:'none',
            display_detailed_view: 'none',
            display_img_detail: 'none',
            isLightBoxOpen: false,
            selected_entry_id: '',
        }
        
        this.handle = this.handle.bind()
        this.onAuthorSelect = this.onAuthorSelect.bind(this)
        this.onAuthorOrder = this.onAuthorOrder.bind(this)
        this.onTitleOrder = this.onTitleOrder.bind(this)
        this.onYearOrder = this.onYearOrder.bind(this)

        this.fetchData = this.fetchData.bind(this)
        this.onPreviousPage = this.onPreviousPage.bind(this)
        this.onNextPage = this.onNextPage.bind(this)
        this.onEntryClick = this.onEntryClick.bind(this)
        this.closeModal = this.closeModal.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)

        this.editEntry = this.editEntry.bind(this);
        this.removeEntry = this.removeEntry.bind(this)
        this.confirmRemoveEntry = this.confirmRemoveEntry.bind(this)
        this.getTitle = this.getTitle.bind(this)

        this.onChangeModalTitle = this.onChangeModalTitle.bind(this);
        this.onChangeModalAuthor = this.onChangeModalAuthor.bind(this);
        this.onChangeModalYear = this.onChangeModalYear.bind(this);
        this.saveEditEntry = this.saveEditEntry.bind(this);

        this.closeLightbox = this.closeLightbox.bind(this);
        this.closeAddImgs = this.closeAddImgs.bind(this);
        this.closeLatestModal = this.closeLatestModal.bind(this);

        this.addImages = this.addImages.bind(this);
        this.showLightBox = this.showLightBox.bind(this);
    }

    componentDidMount(){
        document.addEventListener("keydown", 
                                  (e) => {
                                      if(this.state.modal_display !== 'none')
                                        escFunction(e, this.closeLatestModal)
                                  }, 
                                  false);
    }
    componentWillUnmount(){
        document.removeEventListener("keydown", 
                                    escFunction, 
                                    false);
    }

    componentWillMount(){
        axios.get(this.state.base_url + '/entry_meta').then(
            res => {
                this.setState({
                    authors:  res.data.authors,
                    min_year: parseInt(res.data.min_year),
                    max_year: parseInt(res.data.max_year),
                    filter_from_year: parseInt(res.data.min_year),
                    filter_to_year: parseInt(res.data.max_year),
                })
            }
        )

        this.fetchData();
    }


    fetchData(){
        this.setState({total_elements:'', waiting_to_change:true})

        axios.get(this.state.base_url + '/entries/', 
        {
            params: {
                page_size: this.state.page_size,
                page: page,
                q: this.state.query_text,
                order_year: this.state.order_by_year,
                order_author: this.state.order_by_author,
                order_title: this.state.order_by_title,
                order_created: this.state.order_by_created,
                from_year: this.state.filter_from_year,
                to_year: this.state.filter_to_year,
                author: this.state.filter_author
            }
        })
        .then(
            res => {
                this.setState({
                    data: res.data,
                    total_elements: res.data.total,
                    waiting_to_change: false,
                })
            }
        )
    }

    handle = (props) => {
        this.setState({
            filter_from_year: props[0],
            filter_to_year: props[1],
        })            
    };

    handleInputChange = (e) => {
        // When user types a new query, reset page number
        page = 0;
        this.setState({query_text: e.target.value});
    }

    onAuthorSelect = (e) => {
        this.setState({filter_author: e.target.value});
    } 

    onAuthorOrder = (e) => {
        this.setState({order_by_author: e.target.value})
    }

    onTitleOrder = (e) => {
        this.setState({order_by_title: e.target.value})
    }

    onYearOrder = (e) => {
        this.setState({order_by_year: e.target.value})
    }

    onCreatedOrder = (e) => {
        this.setState({order_by_created: e.target.value})
    }

    onChangeModalTitle = (e) => {
        this.setState({modal_title: e.target.value})
    }

    onChangeModalAuthor = (e) => {
        this.setState({modal_author: e.target.value})
    }
    
    onChangeModalYear = (e) => {
        let errorMessage = (e.target.value.match(/^[1-9]\d*$|^0$|^-[1-9]\d*/g)) 
                            ? ""
                            : "El año tiene que ser 0 o mayor, con un formato válido (01 no es válido)"
                            
        if(errorMessage ===  "" 
            && yearBiggerThanCurrent(e.target.value) ){
            errorMessage = "El año tiene que ser menor que el año actual"
        }

        this.setState({
            modal_year: e.target.value,
            edit_error_message: errorMessage,
        })
    }

    onNextPage(){
        page += 1;
        this.fetchData()
    }

    onPreviousPage(){
        page -= 1;
        this.fetchData()
    }

    onEntryClick = (e) => {
        e.stopPropagation();
        e.preventDefault();

        let entry = this.state.data.entries.find(
                    entry => entry.id === parseInt(e.currentTarget.getAttribute("data-id")));

        this.setState({
            modal_title: entry.title,
            modal_year: entry.year,
            modal_author: entry.author,
            modal_images: entry.entry_images,
            modal_display: '',
            display_detailed_view: '',
        })
    }

    editEntry = (e, entry) => {
        e.preventDefault();
        e.stopPropagation();

        this.setState({
            modal_display: '',
            display_delete_modal: 'none',
            display_edit_modal: '',
            modal_title: entry.title,
            modal_year: entry.year,
            modal_author: entry.author,
            selected_entry_id: entry.id,
        })
    }

    showLightBox(entry_id, index){    

        let entry = this.state.data.entries.find(
            entry => entry.id === entry_id);

        this.setState({
            modal_title: entry.title,
            modal_year: entry.year,
            modal_author: entry.author,
            modal_images: entry.entry_images,
            modal_display: 'none',
            isLightBoxOpen: true,
            photoIndex: index, 
        })


    }

    closeModal() {
        this.setState({
            modal_display: 'none',
            modal_title: '',
            modal_year: '',
            modal_author: '',
            modal_images: [],
            display_edit_modal: 'none',
            display_delete_modal: 'none',
            display_edit_imgs_modal:'none',
            display_add_modal:'none',
            display_detailed_view: 'none',
            selected_entry_id: '',
            edit_error_message:'',
        })
    }

    closeLatestModal() {
        if (this.state.display_edit_imgs_modal !== 'none') {
            this.setState({
                display_edit_imgs_modal:'none',
                modal_images: [],
            });
            return null;
        }
        if (this.state.display_add_modal !== 'none') {
            this.setState({
                display_add_modal:'none',
                modal_images: [],
            });
            return null;
        }
        this.closeModal();

    }

    closeLightbox() {
        this.setState({
            display_edit_imgs_modal: 'none',
            modal_images: [],
        })
    }

    removeEntry(e, id) {
        e.preventDefault();
        e.stopPropagation();

        this.setState({
            modal_display: '',
            display_delete_modal: '',
            display_edit_modal: 'none',
            selected_entry_id: id,
        })
    }

    confirmRemoveEntry(id) {
        axios.delete(this.state.base_url + `/entry/${id}/`,
            { 
                headers: {
                    'Authorization': `Token ${localStorage.getItem("token")}`,
                }
            })
            .then(
                res => {
                    this.closeModal();
                    this.fetchData();
                }
            )
    }

    getTitle() {
        let filtered_entry = this.state.data.entries.filter(entry => entry.id===this.state.selected_entry_id );
        return ( filtered_entry.length <= 0 )
            ? ""
            : filtered_entry[0].title        
    }

    saveEditEntry(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.state.modal_title){
            this.setState({
                edit_error_message: "Introduce título por favor"
            })
            return null;
        }
        
        if (!this.state.modal_author){
            this.setState({
                edit_error_message: "Introduce autor por favor"
            })
            return null;
        }

        if (!this.state.modal_year){
            this.setState({
                edit_error_message: "Introduce año por favor"
            })
            return null;
        }

        if (yearBiggerThanCurrent(this.state.modal_year) ){
            this.setState({
                edit_error_message: "El año tiene que ser menor o igual al actual"
            })
            return null;
        }

        var data={
            title: this.state.modal_title,
            author: this.state.modal_author,
            year: this.state.modal_year,
            id: this.state.selected_entry_id
        }

        axios.patch(this.state.base_url + `/entry/${this.state.selected_entry_id}/`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Authorization': `Token ${localStorage.getItem("token")}`,
                }
            }
        ).then(
            res => {

                window.alert("Datos modificados correctamente");
                var indexOfEntry = this.state.data.entries.indexOf(
                                        this.state.data.entries.filter(
                                            entry => 
                                            entry.id === this.state.selected_entry_id)[0]
                                    )


                var data = this.state.data;
                data.entries[indexOfEntry].title = this.state.modal_title;
                data.entries[indexOfEntry].author = this.state.modal_author;
                data.entries[indexOfEntry].year = this.state.modal_year;

                this.setState({
                    data: data,    
                })
            }
        ).catch(
            error => {
                this.setState({
                    edit_error_message: error.response.message
                })
            }
        )
    }

    editEntryImages = (e) => {
        e.preventDefault();
        e.stopPropagation();

        var imgs = this.state.data.entries.filter(
            entry => entry.id === this.state.selected_entry_id 
        )[0].entry_images

        this.setState({
            display_edit_imgs_modal: '',
            modal_images: [...imgs],
        })
    }

    addImgToEntry = (e) => {
        e.preventDefault();
        e.stopPropagation();

        this.setState({
            display_add_modal: '',
        })
    }

    onFilesUpload = (files) => {
        this.setState({
            modal_images: arrayUnique(this.state.modal_images.concat(files))
        })
    }

    closeAddImgs = () => {
        this.setState({
            display_add_modal: 'none',
            modal_images: [],    
        })
    }

    onImgRemove(e, name) {
        e.preventDefault();
        e.stopPropagation();

        var imgs = this.state.modal_images;
        this.setState({
            modal_images: imgs.filter(img => img.name !== name),
        })
    }

    addImages(e) {

        const formData = new FormData();
        formData.append("entry_id", this.state.selected_entry_id)        

        for (const image of this.state.modal_images) {
            formData.append('images', image)
        }

        axios.post(this.state.base_url + '/images/',
            formData,
            {
                headers: {
                    "Content-Type":"multipart/form-data",
                    'Authorization': `Token ${localStorage.getItem("token")}`,
                }
            }
        )
        .then(
            // On post new image(s), will receive the details of the image(s)
            // Push that image to the state data in order to have an updated version
            // without need of refreshing 
            res => {
                var newImgs = res.data;
                var data = this.state.data;
                
                var selected_index = data.entries.findIndex(entry => entry.id === this.state.selected_entry_id);
                data.entries[selected_index].entry_images.push(...newImgs)

                window.alert("Cambios guardados correctamente");
                this.setState({
                    edit_error_message: '',
                    modal_images: [],
                    data: data,
                })
                this.closeAddImgs();
            }
        ).catch(
            error => {
                this.setState({
                    edit_error_message: error.response.data[0],
                })
            }
        )
    }

    // This should be modified slightly to allow the table to be
    // rendered individually
    render() {
        if ( this.state.min_year === '' || this.state.max_year === '' || this.state.total_elements === '' ) {
            return <div />
        }

        if( this.state.waiting_to_change ) {
            return <div />
        }

        const img_leng = this.state.modal_images.length;
        const photoIndex = this.state.photoIndex;

        return (

        <div className="search_container">
            {
                this.state.isLightBoxOpen && (
                    <Lightbox
                        mainSrc={this.state.base_url + this.state.modal_images[photoIndex].image}
                        nextSrc={this.state.base_url + this.state.modal_images[(img_leng > 1) ? (photoIndex + 1) % img_leng : 0].image}
                        prevSrc={this.state.base_url + this.state.modal_images[(img_leng > 1) ? (photoIndex + img_leng - 1) % img_leng : 0].image}
                        onCloseRequest={() => this.setState({ isLightBoxOpen: false })}
                        onMovePrevRequest={() =>
                        this.setState({
                            photoIndex: (photoIndex + img_leng - 1) % img_leng
                        })
                        }
                        onMoveNextRequest={() =>
                        this.setState({
                            photoIndex: (photoIndex + 1) % img_leng,
                        })
                        }
                        clickOutsideToClose={true}
                        wrapperClassName={this.state.data.image_ids
                            && this.state.data.image_ids.includes(this.state.modal_images[photoIndex].id) 
                            ? "result_found_lightbox"
                            : null}
                    />
                )
            }

            <div className="modal_entry"  style={{display: this.state.modal_display}} >
                <div style={{display: this.state.display_add_modal}}>
                    <div className="modal_add_imgs">
                        <div className="edit_entry_add_imgs">
                            <h3 style={{textAlign:"center", padding:"10px"}}>Añadir imagenes al registro</h3>
                            <Dropzone
                            onDrop={acceptedFiles => this.onFilesUpload(acceptedFiles)}>
                            {({getRootProps, getInputProps, isDragActive}) => (
                                <section>
                                <div style={{fontSize: "small", fontStyle:"italic", textAlign:"center"}}> 
                                    Los nombres de las imagenes tienen que ser únicos 
                                </div>
                                <div {...getRootProps()}    
                                    className="dropzone addDropzone">
                                    <input {...getInputProps()} />
                                    {
                                        this.state.modal_images.length === 0
                                        ? isDragActive 
                                            ? <div className="drop_label row">
                                                    <p style={{width:"100%"}}>Suelta las imágenes aqui... </p>
                                                </div> 
                                            : <div className="drop_label row">
                                                    <p style={{width:"100%"}}> Arrastra y suelta las imágenes, o had click aquí para seleccionar imagenes</p>
                                                </div> 
                                        : null
                                    }

                                    {   this.state.display_add_modal === ''
                                        ?
                                            this.state.modal_images.map(
                                                image => (
                                                    <div className="addentry_row row"
                                                        key={image.name}>
                                                        <div className="col-10">{image.name}</div>
                                                        <div className="col-2" style={{cursor:"pointer"}} onClick={(e) => this.onImgRemove(e, image.name)}> Borrar </div>
                                                    </div>
                                                    )
                                            )
                                        : null
                                    }
                                </div>
                                </section>
                            )}
                            </Dropzone>
                            <div className="modal_add_btns"
                                >
                                <button
                                    className="btn btn-primary"
                                    onClick={this.addImages}
                                    > 
                                    Añadir imagenes 
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={this.closeAddImgs}
                                    >
                                    Cancelar 
                                </button>
                                <div className="login_error"> {this.state.edit_error_message} </div>
                            </div>                            
                        </div>
                    </div>
                </div>
                <div className="modal_edit_entry_detail">
                    <button type="button" className="close" id="btn_close_modal" aria-label="Close" onClick={this.closeModal}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <div style={{display: this.state.display_delete_modal}} >
                        <DeleteModal
                                title={this.getTitle()} 
                                onClick={this.confirmRemoveEntry}
                                selectedId = {this.state.selected_entry_id}
                                onCancelClick= {this.closeModal}
                                />
                    </div>
                    <div style={{display: this.state.display_edit_modal}}>
                        <div className="form_edit_entry height_100">
                            <h3>Editar registro</h3>
                            <form>
                                <label className="username_label">Título</label>
                                <input value={this.state.modal_title}
                                        onChange={this.onChangeModalTitle}
                                        type="text"
                                        required
                                        />
                                <br/>
                                <label className="useremail_label">Autor</label>
                                <br/>
                                <input value={this.state.modal_author}
                                        onChange={this.onChangeModalAuthor}
                                        type="text"
                                        required
                                        />
                                <br/>

                                <label className="userpass_label">Año</label>
                                <br/>
                                <input
                                    value={this.state.modal_year}
                                    onChange={this.onChangeModalYear}
                                    type="text"
                                    />
                                <br/>

                                <button 
                                        style={{margin:"5px 0px"}}
                                        onClick={(e) => this.saveEditEntry(e)} 
                                        type="button" 
                                        className="btn btn-primary" 
                                        data-dismiss="modal">
                                        Guardar
                                        </button>

                                <div style={{color:"red", textAlign:"center"}}>
                                    {this.state.edit_error_message}
                                </div>
                            </form>
                            <div className="edit_entry_img_btns">
                                <button 
                                    style={{marginRight:"10px"}}
                                    onClick={this.addImgToEntry} 
                                    type="button" 
                                    className="btn btn-primary" 
                                    data-dismiss="modal">
                                    Añadir imagenes
                                    </button>

                                <button 
                                    onClick={(e) => this.editEntryImages(e)} 
                                    type="button" 
                                    className="btn btn-primary" 
                                    data-dismiss="modal">
                                    Editar imagenes
                                    </button>
                                </div>

                            <button onClick={this.closeModal} 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    data-dismiss="modal">
                                    Cerrar
                                    </button>

                        </div>
                    </div>
                    <div style={{display: this.state.display_edit_imgs_modal}}>
                        <LightboxReview 
                            closeModal={this.closeLightbox}
                            entry_id={this.state.selected_entry_id}
                            imgs={this.state.modal_images.slice()}
                            />
                    </div>
                </div>
                
               
            </div>


            <div className="search_body">
                <div className="search_filters col-xs-4 col-md-2">
                    <div className="sf_category xs-12">
                        Filtros
                    </div>
                    <div className="search_filter sf_border_bottom xs-12">
                        <div className="sf_name">
                            Autor
                        </div>
                        <div className="sf_filter">
                            <AuthorList
                                onChange={this.onAuthorSelect}
                                authors={this.state.authors}
                                value={this.state.filter_author}
                            />
                        </div>
                    </div>
                    <div className="search_filter xs-12">
                        <div className="sf_name">
                            Filtro por año
                        </div>
                        <div className="sf_filter">
                            <Range 
                                min={this.state.min_year} 
                                max={this.state.max_year} 
                                defaultValue={[this.state.filter_from_year, this.state.filter_to_year]} 
                                onChange={this.handle}
                            />
                        </div>
                        <div className="sf_value">
                            {this.state.filter_from_year} - {this.state.filter_to_year}
                        </div>
                    </div>
                    <div className="sf_category xs-12">
                        Ordenar por...
                    </div>
                    <div className="search_filter sf_border_bottom xs-12">
                        <div className="sf_name">
                            Autor
                        </div>
                        <div className="sf_filter">
                            <OrderBySelector
                                onChange={this.onAuthorOrder}
                                name="order_by_author"
                                value={this.state.order_by_author}
                            />
                        </div>
                    </div>

                    <div className="search_filter sf_border_bottom xs-12">
                        <div className="sf_name">
                            Fecha creación registro
                        </div>
                        <div className="sf_filter">
                            <OrderBySelector
                                onChange={this.onCreatedOrder}
                                name="order_by_reated"
                                value={this.state.order_by_created}
                            />
                        </div>
                    </div>

                    <div className="search_filter sf_border_bottom xs-12">
                        <div className="sf_name">
                            Título
                        </div>
                        <div className="sf_filter">
                            <OrderBySelector
                                onChange={this.onTitleOrder}
                                name="order_by_title"
                                value={this.state.order_by_title}
                            />
                        </div>
                    </div>
                    <div className="search_filter xs-12">                        
                        <div className="sf_name">
                            Año
                        </div>
                        <div className="sf_filter">
                            <OrderBySelector
                                onChange={this.onYearOrder}
                                name="order_by_year"
                                value={this.state.order_by_year}
                            />
                        </div>
                    </div>
                    <div className="search_filter xs-12">
                        <button onClick={this.fetchData} className="sf_name filter_btn">
                            Refinar la busqueda!
                        </button>
                    </div>
                </div>
                <div className="search_results_wrapper col-xs-8 col-md-10">
                    <div className="search_results">
                        <div className="sr_searchbar">
                            <input 
                                onChange={this.handleInputChange} 
                                type="text" 
                                id="searchBarSearch" 
                                className="form-control col-xs-9 display_inline_block" 
                                value={this.state.query_text} 
                                required="" 
                                autoFocus={true}
                                onKeyPress = { (e) => {
                                        if(e.key === 'Enter') {
                                            this.fetchData();
                                        }
                                    }
                                }
                                />
                            <span className="input-group-btn col-xs-2">
                                <button onClick={this.fetchData} className="btn btn-search" type="button">
                                    <i className="fa fa-search fa-fw display_inline_block"></i>
                                </button>
                            </span>
                        </div>
                        <EntriesList entries={this.state.data.entries} 
                                    resultOnImgs={this.state.data.image_ids}
                                    base_url={this.state.base_url} 
                                    onRemoveClick={this.removeEntry}
                                    onEditClick={this.editEntry}
                                    editDelete={true}
                                    showLightBox={this.showLightBox}
                                    />
                        { this.state.total_elements>0 ? 
                            <div className="pagination_container">
                                <div className="total_elements"> 
                                    {(page*this.state.page_size)+1} - {Math.min(this.state.total_elements, ( (1+page) * this.state.page_size ) )} de {this.state.total_elements}
                                </div>
                                <Button name="previous_page_btn"
                                        disabled={page+1 === 1} 
                                        onClick={this.onPreviousPage}/>
                                <Button name="next_page_btn" 
                                        disabled={page+1 === Math.ceil(this.state.total_elements/this.state.page_size)} 
                                        onClick={this.onNextPage}/>
                            </div>
                            :
                            <div></div>
                        }
                    </div>
                </div>
            </div>

        </div>
            
        )
    }

}

export default EntryTable;