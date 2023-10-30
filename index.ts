import { inject } from '@angular/core';
import { Observable, map, firstValueFrom } from 'rxjs';
import { DocumentData, QueryDocumentSnapshot, Firestore, FirestoreDataConverter, QueryFilterConstraint, QueryNonFilterConstraint, and, doc, docSnapshots, endBefore, getDoc, getDocFromCache, limit, orderBy, startAfter, where, getDocsFromCache, query, collection, collectionSnapshots, addDoc, getDocs, FieldPath, OrderByDirection, updateDoc, UpdateData, deleteDoc, setDoc, WithFieldValue, QueryCompositeFilterConstraint, writeBatch, QueryConstraint } from '@angular/fire/firestore';

export class CollectionService<AppModel extends { [x: string]: any } = {[x: string]: any, id: string}, DBModel extends { [x: string]: any } = Omit<AppModel, 'id'> > {

  private firestore = inject(Firestore)
  private path: string
  private converter: FirestoreDataConverter<AppModel, DBModel>

  constructor(path: string, converter?: FirestoreDataConverter<AppModel, DBModel>) {
    this.path = path
    this.converter = converter ?? {
      fromFirestore(snap: QueryDocumentSnapshot<DocumentData, DocumentData>): AppModel {
        return {id: snap.id, ...snap.data()} as unknown as AppModel
      },
      toFirestore({id, ...rest}: AppModel): DBModel {
        return rest as unknown as DBModel
      }
    } 
  }

  async getDoc(id: string): Promise<AppModel | undefined> {
    const docRef = doc(this.firestore, this.path, id).withConverter(this.converter)

    return getDocFromCache(docRef).catch(error => getDoc(docRef)).then(doc => doc.data())
  }

  getDocSnapshots(id: string): Observable<AppModel | undefined> {
    const docRef = doc(this.firestore, this.path, id).withConverter(this.converter)
    
    return docSnapshots(docRef).pipe(map(doc => doc.data()))
  }

  async getByFields(fields: [[key: keyof DBModel & string, value: any]], order?: {fieldPath: string | FieldPath, directionStr?: OrderByDirection | undefined}): Promise<AppModel[]> {
    const colRef = collection(this.firestore, this.path).withConverter(this.converter)
    const contraints: QueryConstraint[] = fields.map(([key, value]) => {
      return where(key, "==", value)
    })
    order ? contraints.push(orderBy(order.fieldPath, order.directionStr)) : null
    const queryData = query(colRef, ...contraints)
    return getDocsFromCache(queryData).then(docs => docs.empty ? getDocs(queryData) : docs).then(docs => docs.docs.map(doc => doc.data()))
  }

  getByFieldSnapshots(fields: [[key: keyof DBModel & string, value: any]], order?: {fieldPath: string | FieldPath, directionStr?: OrderByDirection | undefined}): Observable<AppModel[]> {
    const colRef = collection(this.firestore, this.path).withConverter(this.converter)
    const contraints: QueryConstraint[] = fields.map(([key, value]) => {
      return where(key, "==", value)
    })
    order ? contraints.push(orderBy(order.fieldPath, order.directionStr)) : null
    const queryData = query(colRef, ...contraints)
    return collectionSnapshots(queryData).pipe(map(docs => docs.map(doc => doc.data())))
  }

  async getByFieldContains(fields: [[keyof DBModel & string, any]], order?: {fieldPath: string | FieldPath, directionStr?: OrderByDirection | undefined}): Promise<AppModel[]> {
    const colRef = collection(this.firestore, this.path).withConverter(this.converter)
    const contraints: QueryConstraint[] = fields.map(([key, value]) => {
      return where(key, "array-contains", value)
    })
    order ? contraints.push(orderBy(order.fieldPath, order.directionStr)) : null
    const queryData = query(colRef, ...contraints)
    return getDocsFromCache(queryData).then(docs => docs.empty ? getDocs(queryData) : docs).then(docs => docs.docs.map(doc => doc.data()))
  }

  getByFieldContainsSnapshots(fields: [[keyof DBModel & string, any]], order?: {fieldPath: string | FieldPath, directionStr?: OrderByDirection | undefined}): Observable<AppModel[]> {
    const colRef = collection(this.firestore, this.path).withConverter(this.converter)
    const contraints: QueryConstraint[] = fields.map(([key, value]) => {
      return where(key, "array-contains", value)
    })
    order ? contraints.push(orderBy(order.fieldPath, order.directionStr)) : null
    const queryData = query(colRef, ...contraints)
    return collectionSnapshots(queryData).pipe(map(docs => docs.map(doc => doc.data())))
  }

  async list(order?: {fieldPath: string | FieldPath, directionStr?: OrderByDirection | undefined}): Promise<AppModel[]> {
    const colRef = collection(this.firestore, this.path).withConverter(this.converter)
    const queryData = order ? query(colRef, orderBy(order.fieldPath, order.directionStr)) : colRef
    return getDocsFromCache(queryData).then(docs => docs.empty ? getDocs(queryData) : docs).then(docs => docs.docs.map(doc => doc.data()))
  }

  listSnapshots(order?: {fieldPath: string | FieldPath, directionStr?: OrderByDirection | undefined}): Observable<AppModel[]> {
    const colRef = collection(this.firestore, this.path).withConverter(this.converter)
    const queryData = order ? query(colRef, orderBy(order.fieldPath, order.directionStr)) : colRef
    return collectionSnapshots(queryData).pipe(map(docs => docs.map(doc => doc.data())))
  }

  async add(data: AppModel): Promise<string> {
    const docRef = collection(this.firestore, this.path).withConverter(this.converter)
    return addDoc(docRef, data).then(ref => ref.id)
  }

  async edit(id: string, newDocData: UpdateData<DBModel>): Promise<void> {
    const docRef = doc(this.firestore, this.path, id).withConverter(this.converter)
    return updateDoc(docRef, newDocData)
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.path ,id)
    return deleteDoc(docRef)
  }

  async set(id: string,  data: WithFieldValue<AppModel>): Promise<void> {
    const docRef = doc(this.firestore, this.path, id)
    return setDoc(docRef, data)
  }

  page({field, start, perPage, filter, end, customFilters}:{field: keyof DBModel & (string | FieldPath), start?: unknown, perPage?: number, filter?: string, end?: unknown, customCompositeFilter?: QueryFilterConstraint[]}): Observable<AppModel[]> {
    const compositeFilter: QueryFilterConstraint[] = []
    const queryConstraints: QueryNonFilterConstraint[] = [orderBy(field), limit(perPage ?? 10)]

    if (filter) {compositeFilter.push(where(field, '>=', filter))}
    if (start) {queryConstraints.push(startAfter(start))}
    if (end) {queryConstraints.push(endBefore(end))}

    compositeFilter.push(...customFilters ?? [])
    console.log(compositeFilter)

    return this.querySnapshots( and(...compositeFilter), ...queryConstraints)
  }

  async query(compositeFilter: QueryCompositeFilterConstraint, ...queryConstraints: QueryNonFilterConstraint[]): Promise<AppModel[]> {
    const colRef = collection(this.firestore, this.path).withConverter(this.converter)
    const queryData = query(colRef, compositeFilter, ...queryConstraints)
    return getDocsFromCache(queryData).then(docs => docs.empty ? getDocs(queryData) : docs).then(docs => docs.docs.map(doc => doc.data()))
  }

  querySnapshots(compositeFilter: QueryCompositeFilterConstraint, ...queryConstraints: QueryNonFilterConstraint[]): Observable<AppModel[]> {
    const colRef = collection(this.firestore, this.path).withConverter(this.converter)
    const queryData = query(colRef, compositeFilter, ...queryConstraints)
    return collectionSnapshots(queryData).pipe(map(docs => docs.map(doc => doc.data())))
  }

  async changeFieldOfMultipleDocs(field: string, docs: string[], value: any): Promise<void> {
    const batch = writeBatch(this.firestore)

    for (const document of docs) {
      const docRef = doc(this.firestore, this.path, document)
      batch.update(docRef, {[field]: value})
    }

    return batch.commit()
  }
}
