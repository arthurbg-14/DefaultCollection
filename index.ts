import { FirebaseService } from 'firebaseservice/firebase.service';
import { inject } from '@angular/core';
import { Observable, map, firstValueFrom } from 'rxjs';
import { QueryFilterConstraint, QueryNonFilterConstraint, and, endBefore, limit, orderBy, startAfter, where } from '@angular/fire/firestore';

export class DefaultService<T extends { [x: string]: any }> {

  private firebase = inject(FirebaseService)
  private path: string
  public all: {[id: string]: T & {id: string}} = {}

  constructor(path: string) {
    this.path = path
  }

  get(id: string): Observable<T & {id: string} | undefined> {

    return this.firebase.getDoc<T>(this.path, id).pipe(
      map(doc => {
        if (!doc.exists) {return undefined}
        const docId = {id: doc.id, ...doc.data()!}
        this.cache([docId])
        return docId
      })
    )
  }

  async getCache(id: string): Promise<(T & {id: string}) | undefined> {
    const doc = this.all[id]
    
    if (!doc) {return firstValueFrom(this.get(id))}

    return doc
  }

  async getCacheByField(fields: [[keyof T & string, any]]): Promise<(T & {id: string})[]> {
    let list = Object.values(this.all)

    fields.forEach(field => {
      list = list.filter(e => {
        if (!e[field[0]]) {return false}

        if (e[field[0]] == field[1]) {return true}

        if (typeof e[field[0]] == 'string') {
          if (e[field[0]].toLowerCase().includes(field[1].toLowerCase())) {return true}
        }

        return false
      })
    })

    if (list.length == 0) {
      return firstValueFrom(this.getByFields(fields))
    }

    return list
  }

  async getCacheByFieldContains(fields: [[keyof T & string, any]]): Promise<(T & {id: string})[]> {
    let list = Object.values(this.all)

    fields.forEach(field => {
      list = list.filter(e => {
        if (!e[field[0]]) {return false}

        if (e[field[0]].includes(field[1])) {return true}

        return false
      })
    })

    if (list.length == 0) {
      return firstValueFrom(this.getByFieldContains(fields))
    }

    return list
  }

  getByFields(fields: [[keyof T & string, any]]): Observable<(T & {id: string})[]> {
    return this.firebase.getWithField<T>(this.path, fields).pipe(
      map(query => query.map(doc => {
        const docId = {id: doc.id, ...doc.data()}
        this.cache([docId])
        return docId
      }))
    )
  }

  getByFieldContains(fields: [[keyof T & string, any]]): Observable<(T & {id: string})[]> {
    return this.firebase.getByFieldContain<T>(this.path, fields).pipe(
      map(query => query.map(doc => {
        const docId = {id: doc.id, ...doc.data()}
        this.cache([docId])
        return docId
      }))
    )
  }

  async add(objeto: T): Promise<string> {
    return this.firebase.addDoc(this.path, objeto).then(ref => ref.id)
  }

  list(): Observable<(T & {id: string})[]> {
    return this.firebase.getColection<T>(this.path, 'nome').pipe(
        map(query => query.map(doc => {
          const docId = {id: doc.id, ...doc.data()}
          this.cache([docId])
          return docId
        }))
      )
  }

  listOrderedBy(field: keyof T & string): Observable<(T & {id: string})[]> {
    return this.firebase.query<T>(this.path, and(), orderBy(field, "asc")).pipe(
      map(query => query.map(doc => {
        const docId = {id: doc.id, ...doc.data()}
        this.cache([docId])
        return docId
      }))
    )
  }

  async edit(id: string, objeto: Partial<T>): Promise<void> {
    return this.firebase.updateDoc(this.path, id, objeto)
  }

  async delete(id: string): Promise<void> {
    return this.firebase.removeDoc(this.path, id)
  }

  async set(id: string, usuario: T): Promise<void> {
    return this.firebase.setDoc(this.path, id, usuario)
  }

  cache(docs: (T & {id: string})[]) {
    for (const document of docs) {
      this.all[document.id] = document
    }
  }

  page({field, start, perPage, filter, end}:{field: string, start?: string, perPage?: number, filter?: string, end?: string}): Observable<(T & {id: string})[]> {
    const compositeFilter: QueryFilterConstraint[] = []
    const queryConstraints: QueryNonFilterConstraint[] = [orderBy(field), limit(perPage ?? 10)]

    if (filter) {compositeFilter.push(where(field, '>=', filter))}
    if (start) {queryConstraints.push(startAfter(start))}
    if (end) {queryConstraints.push(endBefore(end))}

    return this.firebase.query<T>(this.path, and(...compositeFilter), ...queryConstraints)
      .pipe(map(query => query.map(doc => {
        const docId = {id: doc.id, ...doc.data()}
        this.cache([docId])
        return docId
    })))

  }

  async changeMultipleDocs(field: string, docs: string[], value: string): Promise<void> {
    return this.firebase.changeMultipleDocs(this.path, field, docs, value)
  }
}
