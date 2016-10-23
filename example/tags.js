import React from 'react';
import {
    ChipField,
    Create,
    Datagrid,
    DisabledInput,
    Edit,
    EditButton,
    Filter,
    List,
    TextField,
    TextInput,
} from 'admin-on-rest/mui';

export TagIcon from 'material-ui/svg-icons/action/book';

const TagFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn />
        <TextInput label="Title" source="title" />
    </Filter>
);

export const TagList = (props) => (
    <List {...props} filter={TagFilter}>
        <Datagrid>
            <TextField source="id" />
            <ChipField source="name" />
            <EditButton />
        </Datagrid>
    </List>
);

export const TagCreate = (props) => (
    <Create {...props} >
        <TextInput source="name" />
    </Create>
);


const TagTitle = ({ record }) => {
    return <span>Tag {record ? `"${record.name}"` : ''}</span>;
};

export const TagEdit = (props) => (
    <Edit title={TagTitle} {...props}>
        <DisabledInput label="Id" source="id" />
        <DisabledInput label="Name" source="name" />
    </Edit>
);
