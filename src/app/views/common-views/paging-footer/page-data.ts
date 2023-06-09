export interface ISpringPage{
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    pageable: {
      offset: number;
      pageNumber: number;
      pageSize: number;
      paged: boolean;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      }
      unpaged: boolean;
    }
    size: number;
    totalElements: number;
    totalPages: number;
  }