import React, { Component } from 'react';

import axios from 'axios';

import Header from './generics/header'

import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';

import Slider from 'rc-slider';

import { EntriesList, AuthorList, OrderBySelector } from './generics/searchGenerics'

import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';


const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);

const Button = ({name, disabled, onClick}) => (
    
    <button 
        className={ disabled ? name + " disabled_pagination" : name } 
        disabled={disabled} 
        onClick={onClick}
    />
);

// Due to setState delay issues, variable managed on a higher level
let page = 0;

class Search extends Component {

    constructor(props){
        super(props)

        this.state = {
            data: props.location.state.detail ? props.location.state.detail : {},
            query_text: props.location.state.query,
            
            filter_author: '',
            filter_from_year: '',
            filter_to_year: '',
            
            order_by_year: '',
            order_by_author: '',
            order_by_title: '',

            isLoggedIn: true,

            author:   '',
            min_year: '',
            max_year: '',

            page_size: 5,

            base_url: props.location.state.base_url,
            total_elements: props.location.state.detail.total,

            waiting_to_change: false,

            modal_display: 'none',
            modal_title: '',
            modal_year: '',
            modal_author: '',
            modal_images: [],
            img_detail_display: 'none',
            img_detail_src: '',
            photoIndex: 0,
            isLightBoxOpen: false,
        }

        this.headers = [
                {label: "Titulo", id: "title", numeric: false, disablePadding: true},
                {label: "Autor", id: "author", numeric: false, disablePadding: true},
                {label: "Año", id: "year", numeric: true, disablePadding: true},
                {label: "Imagenes", id: "entry_images", numeric: false, disablePadding: true},
            ];

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

        this.showLightBox = this.showLightBox.bind(this);
    }
  
    async fetchData(){

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

    componentDidMount(){
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
        })
    }

    closeModal() {
        this.setState({
            modal_display: 'none',
            modal_title: '',
            modal_year: '',
            modal_author: '',
            modal_images: [],
            img_detail_display: 'none',
            img_detail_src: '',
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
            modal_display: '',
            isLightBoxOpen: true,
            photoIndex: index, 
        })

    }

    render() {

    const img_leng = this.state.modal_images.length;
    const photoIndex = this.state.photoIndex;

    if ( this.state.min_year === '' || !this.state.max_year === '' || this.state.total_elements === '' ) {
        return <div />
    }

    if( this.state.waiting_to_change ) {
        return <div />
    }

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

            <div className="search_wrapper">
                <div className="search_header">
                    <Header isLoggedIn={this.state.isLoggedIn}/>
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
                                    min={this.state.min_year || 0} 
                                    max={this.state.max_year || 2019} 
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
                                    onKeyPress = { (e) => {
                                            if(e.key === 'Enter') {
                                                this.fetchData();
                                            }
                                        }
                                    }
                                    required="" 
                                    autoFocus={true}/>
                                <span className="input-group-btn col-xs-2">
                                    <button onClick={this.fetchData} className="btn btn-search" type="button">
                                        <i className="fa fa-search fa-fw display_inline_block"></i>
                                    </button>
                                </span>
                            </div>
                            <EntriesList editDelete={false} 
                                        resultOnImgs={this.state.data.image_ids}
                                        entries={this.state.data.entries} 
                                        base_url={this.state.base_url} 
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

                <div className="search_footer xs-12">
                </div>

            </div>
        </div>
    );

    }
}

export default Search;
