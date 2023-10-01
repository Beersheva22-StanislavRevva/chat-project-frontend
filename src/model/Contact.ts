type Contact  = {
    id?: any,
    age?: number,
    birthDate: Date,
    name: string,
    department: string,
    salary: number,
    gender: 'male' | 'female'
    username: string,
    roles:string[],
    passwordHash:string,
    nickname:string,
    blocked: number,
    avatar:string,
    active?:string

}
export default Contact;