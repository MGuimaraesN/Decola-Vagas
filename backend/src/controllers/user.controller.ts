import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/prisma.js';

export class UserController {

    async register(req: Request, res: Response) {
        try {
            const {firstName, lastName, email, password} = req.body;

            if (!email || !password) {
                return res.status(400).json(
                    {error: 'Email e senha são obrigatórios'}
                )};

            const hashedPassword = await bcrypt.hash(password, 10);
            const ipUser = req.ip || 'IP não disponível';

            const userExist = await prisma.user.findUnique({
                where: {email: email}
            });

            if (userExist) {
                return res.status(409).json(
                    {error: 'Email já cadastrado'}
                )};

            const newUser = await prisma.user.create({
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: hashedPassword,
                    ip: ipUser
                }});

            const secret = process.env.JWT_SECRET;

            if (!secret) {
                // Se você esqueceu o .env, dará este erro
                throw new Error('Secret não está definido!');
            }

            const payload = {
                userId: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email
            };

            const token = jwt.sign(payload, secret, { expiresIn: '8h' });

            return res.status(200).json({
                access_token: token
            });

        } catch (error) {
            console.error ('Erro ao registrar usuário:', error);
            return res.status(500).json({error: 'Erro interno do servidor'});
        };
    }

    async login(req: Request, res: Response) {
        try {
            const {email, password} = req.body;
            const ipUser = req.ip || 'IP não disponível';

            if (!email || !password) {
                return res.status(400).json(
                    {error: 'Email e senha são obrigatórios'}
                )};

            const user = await prisma.user.findUnique({
                where: {email: email}
            });

            if (!user) {
                return res.status(401).json(
                    {error: 'Email ou senha inválidos'}
                )};

            const matchedPassword = await bcrypt.compare(password, user.password);

            if (!matchedPassword) {
                return res.status(401).json(
                    {error: 'Email ou senha inválidos'}
                )};

            await prisma.user.update({
                    where: { id: user.id },
                    data: {
                    lastLogin: new Date(),
                    ip: ipUser
                    }
                });

            const secret = process.env.JWT_SECRET;

            if (!secret) {
                // Se você esqueceu o .env, dará este erro
                throw new Error('Secret não está definido!');
            }

            const payload = {
                userId: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                activeInstitutionId: user.activeInstitutionId
            };

            const token = jwt.sign(payload, secret, { expiresIn: '8h' });

            return res.status(200).json({
                access_token: token
            });

        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return res.status(500).json({error: 'Erro interno do servidor'});
            };
        }

    async profile(req: Request, res: Response) {
        try {
            const userEmail = (req as any).user?.email;

            const userData = await prisma.user.findUnique({
                where: {email: userEmail},
                include: {
                    institutions: {
                        include: {
                            institution: true,
                            role: true
                        }
                    }
                }
            });

            res.status(200).json({
                userId: userData?.id,
                firstName: userData?.firstName,
                lastName: userData?.lastName,
                email: userData?.email,
                institutions: userData?.institutions,
                activeInstitutionId: userData?.activeInstitutionId
            })
        } catch (error) {
            console.error('Erro ao obter perfil do usuário:', error)
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    }

    async changePassword(req: Request, res: Response) {
        try {
            const userEmail = (req as any).user?.email;
            const { oldPassword, newPassword } = req.body;

            const user = await prisma.user.findUnique({
                where: { email: userEmail }
            });

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            const isMatch = await bcrypt.compare(oldPassword, user.password);

            if (!isMatch) {
                return res.status(401).json({ error: 'Senha antiga incorreta' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { email: userEmail },
                data: { password: hashedPassword }
            });

            res.status(200).json({ message: 'Senha alterada com sucesso' });
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async switchInstitution(req: Request, res: Response) {
        try {
            const userEmail = (req as any).user?.email;
            const { institutionId } = req.body;

            const user = await prisma.user.findUnique({
                where: { email: userEmail },
                include: { institutions: true }
            });

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            const isMember = user.institutions.some(inst => inst.institutionId === institutionId);

            if (!isMember) {
                return res.status(403).json({ error: 'Usuário não pertence a esta instituição' });
            }

            await prisma.user.update({
                where: { email: userEmail },
                data: { activeInstitutionId: institutionId }
            });

            res.status(200).json({ message: 'Instituição alterada com sucesso' });
        } catch (error) {
            console.error('Erro ao trocar de instituição:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
};
