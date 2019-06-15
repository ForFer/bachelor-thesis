import React from 'react';

export const Button = ({name, disabled, onClick}) => (
    <button 
        className={ disabled ? name + " disabled_pagination" : name } 
        disabled={disabled} 
        onClick={onClick}
    />
);

export const AuthorList = ({onChange, authors, value}) => (
    <select name=""
            id="author_profile"
            onChange={onChange}
            value={value}
            >
        <option value="">Autores</option>
        {authors.map(author => <option key={author[0]} value={author[0]}>{author[0]}</option>)}
    </select>
);

export const OrderBySelector = ({onChange, name, value}) => (
    <select name={name}
        onChange={onChange}
        value={value}
        >
        <option value="0">Ordenar...</option>
        <option key="1" value="ASCENDING">Ascendente</option>
        <option key="-1" value="DESCENDING">Descendente</option>
    </select>
);

export const EntriesList = ({entries, base_url, onRemoveClick, 
    onEditClick, editDelete, resultOnImgs, showLightBox}) => (
    
    <div className="table_container">
        {
            entries.length>0 ?
            (
                entries.map(entry =>
                    <EntryDetail 
                        editDelete={editDelete} 
                        key={entry.id} 
                        entry={entry} 
                        base_url={base_url} 
                        onRemoveClick={onRemoveClick}
                        onEditClick={onEditClick} 
                        resultOnImgs={resultOnImgs}
                        showLightBox={showLightBox}
                        />
                )
            ) : (
                <div key="no_results" className="no_results"> No se han encontrado resultados </div>
            )
        }
    </div>
);

export const EntryDetail = ({entry, base_url, onRemoveClick, onEditClick, 
    editDelete, resultOnImgs, showLightBox}) => (
    <div className="entryDetail" 
        key={entry.id} 
        onClick={() => showLightBox(entry.id, 0)}
        >
        {
            (editDelete)
            ?   <div className="entryEdit">
                    <i className="fas fa-edit e_edit entry_action_icon"                
                        onClick={(e) => onEditClick(e, entry)}>
                        Editar </i>
                    <i className="fas fa-trash-alt e_delete entry_action_icon" 
                        onClick={(e) => onRemoveClick(e, entry.id)}>Borrar </i>
                    {/* <div className="e_edit"><i className="fas fa-edit"></i></div>
                    <div className="e_delete" onClick={() => onRemoveClick(entry.id)}><i className="fas fa-trash-alt"></i></div> */}
                </div>
            :   null
        }
        <div className="entryMeta">
            <div className="em_title">Título: {entry.title}</div>
            <div className="em_author">Author: {entry.author}</div>
            <div className="em_year">Año: {entry.year}</div>
        </div>
        <div className="entryImages">
            {
                entry.entry_images.map(img => 
                    <div key={entry.id + "-" + img.id} className="entryImageDetail">
                        <img alt="" 
                            className={resultOnImgs && resultOnImgs.includes(img.id) 
                                ? "eid_image result_found"
                                : "eid_image "}
                            id={img.id} 
                            src={base_url + img.image}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                showLightBox(entry.id, entry.entry_images.indexOf(img));
                                }
                            }
                            />
                    </div>     
                )
            }
        </div>
    </div>
)