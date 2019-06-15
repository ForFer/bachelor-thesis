import React from 'react';


const UsersList = ({users, base_url, onClick, onRemoveClick, onEditClick, editDelete, currentUser}) => (
    
    <div className="table_container">
        <div className="Header row header_users">
            <div className="col-4">Nombre de usuario</div>
            <div className="col-4">Email</div>
            <div className="col-4">Acciones</div>
        </div>
        {
            users.length>0 ?
            (
                users.map(user =>
                    <UserDetail editDelete={editDelete} 
                                key={user.id} 
                                user={user} 
                                base_url={base_url} 
                                onClick={onClick} 
                                onRemoveClick={onRemoveClick}
                                onEditClick={onEditClick}
                                currentUser={parseInt(currentUser)}
                                />
                )
            ) : (
                <div key="no_results" className="no_results"> No se han encontrado resultados </div>
            )
        }
    </div>
);

const UserDetail = ({user, base_url, onClick, onRemoveClick, onEditClick, currentUser}) => (
    <div className={(currentUser === user.id)
                    ? "userDetail currentUser"
                    : "userDetail"
                    } 
         key={user.id} 
         data-id={user.id} 
         onClick={onClick}>
        <div className="row">
            <div className="col-4 user_username">{user.username}</div>
            <div className="col-4">{user.email}</div>
            <div className="col-4">
                <i className="fas fa-edit e_edit u_edit"                
                    onClick={() => onEditClick(user.id)}
                    >
                    Editar </i>
                {
                    (currentUser === user.id)
                    ? null
                    :   <i className="fas fa-trash-alt e_delete" 
                        onClick={() => onRemoveClick(user.id)}>Borrar </i>
                }
            </div>
        </div>
    </div>
)

export default UsersList;