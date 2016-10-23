import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import get from 'lodash.get';
import LinearProgress from 'material-ui/LinearProgress';
import {
    crudGetManyReference as crudGetManyReferenceAction,
    crudGetMany as crudGetManyAction,
} from '../../actions/dataActions';
import { getReferences, nameRelatedTo } from '../../reducer/references/oneToMany';
import { getRecordsByIds } from '../../reducer/resource/data';
/**
 * Render related records to the current one.
 *
 * You must define the fields to be passed to the iterator component as children.
 *
 * @example Display all the comments of the current post as a datagrid
 * <ReferenceManyField reference="comments" target="post_id">
 *     <Datagrid>
 *         <TextField source="id" />
 *         <TextField source="body" />
 *         <DateField source="created_at" />
 *         <EditButton />
 *     </Datagrid>
 * </ReferenceManyField>
 *
 * @example Display all the books by the current author, only the title
 * <ReferenceManyField reference="books" target="author_id">
 *     <SingleFieldList>
 *         <ChipField source="title" />
 *     </SingleFieldList>
 * </ReferenceManyField>
 */
export class ReferenceManyField extends Component {
    componentDidMount() {
        this.fetchReference(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.record.id !== nextProps.record.id) {
            this.fetchReference(nextProps);
        }
    }

    fetchReference(props) {
        const { reference, record, resource, target, source } = props;

        if (target) {
            const relatedTo = nameRelatedTo(reference, record.id, resource, target);
            props.crudGetManyReference(reference, target, record.id, relatedTo);
        } else if (source) {
            props.crudGetMany(reference, get(record, source));
        }
    }

    render() {
        const { resource, reference, referenceRecords, children, basePath } = this.props;
        if (React.Children.count(children) !== 1) {
            throw new Error('<ReferenceManyField> only accepts a single child (like <Datagrid>)');
        }
        if (typeof referenceRecords === 'undefined') {
            return <LinearProgress style={{ marginTop: '1em' }} />;
        }
        const referenceBasePath = basePath.replace(resource, reference); // FIXME obviously very weak
        return React.cloneElement(children, {
            resource: reference,
            ids: Object.keys(referenceRecords),
            data: referenceRecords,
            basePath: referenceBasePath,
            currentSort: {},
        });
    }
}

ReferenceManyField.propTypes = {
    basePath: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired,
    crudGetManyReference: PropTypes.func.isRequired,
    includesLabel: PropTypes.bool,
    label: PropTypes.string,
    record: PropTypes.object,
    reference: PropTypes.string.isRequired,
    referenceRecords: PropTypes.object,
    resource: PropTypes.string.isRequired,
    target: PropTypes.string,
    source: PropTypes.oneOfType([PropTypes.string, function validateSourceOrTarget(props) {
        return (!props.target && !props.source) ?
            new Error('You need to specify either "source" or "target" in <ReferenceManyField>') :
            undefined;
    }]),
};

function getTargetRecords(state, props) {
    const relatedTo = nameRelatedTo(props.reference, props.record.id, props.resource, props.target);
    return getReferences(state, props.reference, relatedTo);
}

function getSourceRecords(state, props) {
    return getRecordsByIds(state, props.reference, get(props.record, props.source));
}

function mapStateToProps(state, props) {
    let referenceRecords;

    if (props.target) {
        referenceRecords = getTargetRecords(state, props);
    } else if (props.source) {
        referenceRecords = getSourceRecords(state, props);
    }

    return {
        referenceRecords,
    };
}

const ConnectedReferenceManyField = connect(mapStateToProps, {
    crudGetManyReference: crudGetManyReferenceAction,
    crudGetMany: crudGetManyAction,
})(ReferenceManyField);

ConnectedReferenceManyField.defaultProps = {
    includesLabel: false,
};

export default ConnectedReferenceManyField;
