import { TokenResponseDto } from "../../common/dtos";
import prisma from "../../helpers/db";
import { mapTokenToDto } from "../../helpers/mappers/mapperDto";

export const getTokensByChainId = async (
  chainId: string
): Promise<TokenResponseDto[]> => {

  const parsedChainId = Number.parseInt(chainId);
  const chain = await prisma.chain.findFirst({
    where: {
      chainId: parsedChainId,
    },
  });

  const tokens: TokenResponseDto[] = [];
  if (chain) {
    const chainTokens = await prisma.chainsOnTokens.findMany({
      where: {
        chain_id: chain.id,
      },
      include: {
        token: {
          select: {
            id: true,
            name: true,
            address: true,
            decimals: true,
            symbol: true,
          },
        },
        chain: {
          select: {
            id: true,
            chainId: true,
          },
        },
      },
    });

    for (let i = 0; i < chainTokens.length; i++) {
      const item = chainTokens[i];
      const dto: TokenResponseDto = mapTokenToDto(item.token, item.chain.id);
      tokens.push(dto);
    }
  }

  return tokens;
};
