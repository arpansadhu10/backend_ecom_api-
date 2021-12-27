// base -Product.find
// bigQuery

class WhereClause {
    constructor(base, bigQuery) {
        this.base = base;
        this.bigQuery = bigQuery;
    }
    search() {
        const searchWord = this.bigQuery.search ? {
            name: {
                $regex: this.bigQuery.search,
                $op: 'i' //case insensitivity
            }
        } : {}

        this.base = this.base.find({ ...searchWord })
        return this;
    }

    filter() {
        const copyQuery = { ...this.bigQuery };

        delete copyQuery["search"];
        delete copyQuery["page"];
        delete copyQuery["limit"];

        //convert bigQuery into string as regex only works on string
        let string_CopyQuery = JSON.stringify(copyQuery);

        string_CopyQuery = string_CopyQuery.replace(/\b(gte|lte|gt|lt)\b/g, m => `$${m}`)

        const jsonOf_copyQuery = JSON.parse(string_CopyQuery)

        this.base = this.base.find(jsonOf_copyQuery);
        return this;
    }

    pager(resultPerPage) {
        let currentPage = 1;
        if (this.bigQuery.page) {
            currentPage = this.bigQuery.page
        }
        const skipValue = resultPerPage * (currentPage - 1);

        this.base = this.base.limit(resultPerPage).skip(skipValue);
        return this;
    }
}

module.exports = WhereClause;